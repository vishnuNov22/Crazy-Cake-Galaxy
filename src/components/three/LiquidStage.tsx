"use client";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import type { LiquidFrame } from "@/lib/showroom";

/* ------------------------------------------------------------------------------------------
 * LiquidStage — a full-bleed WebGL plane that morphs one photograph into another.
 *
 * The transition is a slow pour of glossy chocolate: an irregular, drip-fingered front sweeps
 * across the frame, leaving the next photograph behind it. The leading edge is a thin band of
 * dark chocolate with a specular streak, and the picture bends very slightly around it.
 * Everything is procedural (no displacement textures to ship) and driven by a single uniform,
 * `uProgress`, so it can be played, dragged by hand, or scrubbed by scroll.
 *
 * Rendering is on demand (`frameloop="demand"`): the GPU is idle unless something is moving.
 * ---------------------------------------------------------------------------------------- */

export type LiquidHandle = {
  /** Current committed frame index. */
  readonly index: number;
  /** Play a transition to `to`. `dir` is the direction the chocolate travels. */
  go: (to: number, dir?: [number, number], duration?: number) => Promise<void>;
  /** Start a drag-driven transition (follow with setProgress, then finish). */
  begin: (to: number, dir: [number, number]) => void;
  setProgress: (p: number) => void;
  finish: (commit: boolean) => Promise<void>;
  /** Scroll-scrubbing: 0..n-1 as a float. */
  scrub: (v: number) => void;
};

type Props = {
  frames: LiquidFrame[];
  initial?: number;
  handleRef: MutableRefObject<LiquidHandle | null>;
  onReady?: () => void;
  onFail?: () => void;
};

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform vec4 uMetaA;   // aspect, scale, arch(0/1), unused
  uniform vec4 uMetaB;
  uniform vec2 uFocA;
  uniform vec2 uFocB;
  uniform vec3 uTintA;
  uniform vec3 uTintB;
  uniform float uProgress;
  uniform vec2 uDir;
  uniform vec2 uRes;
  uniform vec2 uPointer;
  uniform float uHover;
  uniform float uTime;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  float sdArch(vec2 p, vec2 size) {
    float r = size.x * 0.5;
    vec2 q = vec2(abs(p.x), p.y);
    float yTop = size.y * 0.5 - r;
    return q.y > yTop ? length(vec2(q.x, q.y - yTop)) - r : max(q.x - r, -q.y - size.y * 0.5);
  }
  float sdBox(vec2 p, vec2 size) {
    vec2 q = abs(p) - size * 0.5;
    return max(q.x, q.y);
  }

  // The photograph composed on the stage: ambient glow + (arch|rect) picture + gold keyline.
  vec3 stage(sampler2D tex, vec4 meta, vec2 foc, vec3 tint, vec2 uv) {
    float ca = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(ca, 1.0);
    float aspImg = meta.x;
    float sc = meta.y;
    bool arch = meta.z > 0.5;

    vec2 size; vec2 c = vec2(0.0);
    if (arch) {
      float H = sc;
      size = vec2(min(H * 0.8, ca * 0.9), H);
      c = vec2(0.0, 0.015);
    } else {
      size = vec2(ca, 1.0) * sc;
    }

    // ambient: deep navy that quietly takes on the photograph's own colour
    vec3 blush = vec3(0.992, 0.894, 0.914);
    float r = length(uv - 0.5);
    vec3 bg = mix(blush * 1.005, blush * 0.9, smoothstep(0.0, 0.85, r));
    float glow = (1.0 - smoothstep(0.0, 0.75, length((p - c) * vec2(0.8, 1.0))));
    bg = mix(bg, mix(tint, vec3(1.0), 0.5), 0.3 * glow);

    float d = arch ? sdArch(p - c, size) : sdBox(p - c, size);
    float aa = 1.5 / uRes.y;
    float m = 1.0 - smoothstep(-aa, aa, d);

    vec2 bu = (p - c) / size + 0.5;
    float boxAsp = size.x / size.y;
    vec2 s = boxAsp > aspImg ? vec2(1.0, aspImg / boxAsp) : vec2(boxAsp / aspImg, 1.0);
    vec2 tuv = bu * s + (1.0 - s) * vec2(foc.x, 1.0 - foc.y);
    vec3 col = texture2D(tex, clamp(tuv, 0.001, 0.999)).rgb;

    vec3 outc = mix(bg, col, m);
    if (arch) {
      // soft contact shadow + fine gold keyline just outside the arch
      outc *= 1.0 - 0.14 * (1.0 - smoothstep(0.0, 0.06, d)) * (1.0 - m);
      float line = (1.0 - smoothstep(0.0, aa * 1.6, abs(d - 0.026)));
      outc = mix(outc, vec3(0.81, 0.2, 0.4), line * 0.85);
    }
    return outc;
  }

  void main() {
    vec2 uv = vUv;

    // direction of travel and the coordinate across it
    vec2 dir = normalize(uDir);
    vec2 perp = vec2(-dir.y, dir.x);
    vec2 cu = uv - 0.5;
    float sCoord = dot(cu, dir);
    float tCoord = dot(cu, perp);

    float prog = clamp(uProgress, 0.0, 1.0);
    float front = mix(-0.78, 0.78, prog);

    // a soft, irregular front with a few long, slow drips (smooth noise only — no jagged edges)
    float wobble = (noise(vec2(tCoord * 2.2, 1.7)) * 0.62 + noise(vec2(tCoord * 5.0, 9.3)) * 0.38 - 0.5) * 0.24;
    float fine   = (noise(vec2(tCoord * 17.0, sCoord * 2.0)) - 0.5) * 0.008;
    float drips  = smoothstep(0.38, 0.95, noise(vec2(tCoord * 5.6, 3.1))) * 0.2;
    float m = (front + wobble + fine + drips) - sCoord;   // >0 : already transformed

    float life = sin(3.14159265 * prog);                  // 0 at both ends
    float prox = exp(-abs(m) * 11.0) * life;

    // the picture bends faintly around the liquid edge
    vec2 bend = perp * (noise(uv * 3.0 + uTime * 0.15) - 0.5) * 0.03 * prox + dir * prox * 0.012;
    // very gentle pointer ripple (idle liquid life)
    vec2 toP = uv - uPointer;
    float dp = length(toP);
    bend += normalize(toP + 1e-5) * 0.006 * uHover * (1.0 - smoothstep(0.0, 0.45, dp)) * sin(dp * 38.0 - uTime * 2.2);
    vec2 uvd = uv + bend;

    vec3 colA = stage(uTexA, uMetaA, uFocA, uTintA, uvd);
    vec3 colB = stage(uTexB, uMetaB, uFocB, uTintB, uvd);
    float inB = smoothstep(-0.004, 0.004, m);
    vec3 col = mix(colA, colB, inB);

    // glossy chocolate leading edge
    float bw = 0.034 * life;
    float band = smoothstep(-bw - 0.004, -bw + 0.004, m) * (1.0 - smoothstep(0.004, 0.014, m));
    float k = clamp((m + bw) / (bw + 0.014 + 1e-4), 0.0, 1.0);
    vec3 choc = mix(vec3(0.075, 0.042, 0.028), vec3(0.19, 0.105, 0.06), k);
    float spec = pow(clamp(1.0 - abs(k * 2.0 - 0.62), 0.0, 1.0), 7.0);
    float spec2 = pow(clamp(1.0 - abs(k * 2.0 - 1.45), 0.0, 1.0), 14.0);
    choc += vec3(1.0, 0.86, 0.66) * (spec * 0.55 + spec2 * 0.25);
    choc += (fbm(uv * 22.0) - 0.5) * 0.03;
    col = mix(col, choc, band * 0.97);

    // photographic finish: faint vignette + fine grain (also settles upscaled sources)
    col *= 1.0 - 0.08 * smoothstep(0.55, 1.05, length(uv - 0.5) * 1.3);
    col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.028;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const ease = "power2.inOut";

function Scene({ frames, initial = 0, handleRef, onReady, onFail }: Props) {
  const { size, invalidate, gl } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const texs = useRef<THREE.Texture[]>([]);
  const tints = useRef<THREE.Vector3[]>([]);
  const aspects = useRef<number[]>([]);
  const state = useRef({ a: initial, b: initial, tween: null as gsap.core.Tween | null, ready: false });
  const pointer = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, hover: 0, thover: 0 });

  // R3F clones the `uniforms` prop, so always write through the live material.
  const U = () => mat.current!.uniforms as Record<string, THREE.IUniform>;

  const initialUniforms = useMemo(
    () => ({
      uTexA: { value: null as THREE.Texture | null },
      uTexB: { value: null as THREE.Texture | null },
      uMetaA: { value: new THREE.Vector4(1, 1, 0, 0) },
      uMetaB: { value: new THREE.Vector4(1, 1, 0, 0) },
      uFocA: { value: new THREE.Vector2(0.5, 0.5) },
      uFocB: { value: new THREE.Vector2(0.5, 0.5) },
      uTintA: { value: new THREE.Vector3(0.3, 0.2, 0.15) },
      uTintB: { value: new THREE.Vector3(0.3, 0.2, 0.15) },
      uProgress: { value: 0 },
      uDir: { value: new THREE.Vector2(0, -1) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  const assign = (slot: "A" | "B", i: number) => {
    const f = frames[i];
    const t = texs.current[i];
    if (!f || !t) return;
    U()[`uTex${slot}`].value = t;
    U()[`uMeta${slot}`].value.set(aspects.current[i] || 1, f.scale, f.arch ? 1 : 0, 0);
    U()[`uFoc${slot}`].value.set(f.focus[0], f.focus[1]);
    U()[`uTint${slot}`].value.copy(tints.current[i]);
  };

  /* canvas size */
  useEffect(() => {
    U().uRes.value.set(size.width, size.height);
    invalidate();
  }, [size.width, size.height, invalidate]);

  /* textures */
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const loaded: THREE.Texture[] = [];
    const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    Promise.all(
      frames.map(
        (f, i) =>
          new Promise<void>((resolve, reject) => {
            loader.load(
              f.src,
              (tex) => {
                tex.colorSpace = THREE.NoColorSpace; // all grading maths happen in display space
                tex.anisotropy = maxAniso;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                const img = tex.image as { width: number; height: number };
                aspects.current[i] = img.width / img.height;
                tints.current[i] = averageColour(tex.image as CanvasImageSource);
                loaded[i] = tex;
                texs.current[i] = tex;
                resolve();
              },
              undefined,
              reject,
            );
          }),
      ),
    )
      .then(() => {
        if (cancelled) return;
        texs.current.forEach((t) => gl.initTexture(t)); // upload now, not mid-transition
        assign("A", state.current.a);
        assign("B", state.current.b);
        state.current.ready = true;
        invalidate();
        onReady?.();
      })
      .catch(() => !cancelled && onFail?.());
    return () => {
      cancelled = true;
      state.current.tween?.kill();
      loaded.forEach((t) => t?.dispose());
      texs.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames]);

  /* pointer — a faint ripple, only while hovering */
  useEffect(() => {
    const el = gl.domElement;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      pointer.current.tx = (e.clientX - r.left) / r.width;
      pointer.current.ty = 1 - (e.clientY - r.top) / r.height;
      pointer.current.thover = 1;
      invalidate();
    };
    const leave = () => {
      pointer.current.thover = 0;
      invalidate();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [gl, invalidate]);

  useFrame((_, dt) => {
    const p = pointer.current;
    const k = 1 - Math.pow(0.0015, dt);
    p.x += (p.tx - p.x) * k;
    p.y += (p.ty - p.y) * k;
    p.hover += (p.thover - p.hover) * k;
    U().uPointer.value.set(p.x, p.y);
    U().uHover.value = p.hover;
    U().uTime.value += dt;
    // keep drawing until the ripple has settled
    if (Math.abs(p.tx - p.x) > 0.001 || Math.abs(p.ty - p.y) > 0.001 || Math.abs(p.thover - p.hover) > 0.002) invalidate();
  });

  /* imperative API */
  useEffect(() => {
    const s = state.current;
    const setP = (v: number) => {
      U().uProgress.value = v;
      invalidate();
    };
    const commit = () => {
      s.a = s.b;
      assign("A", s.a);
      setP(0);
    };
    const run = (to: number, dur: number) =>
      new Promise<void>((resolve) => {
        s.tween?.kill();
        const o = { v: U().uProgress.value as number };
        s.tween = gsap.to(o, {
          v: to,
          duration: dur,
          ease,
          onUpdate: () => setP(o.v),
          onComplete: () => resolve(),
          onInterrupt: () => resolve(),
        });
      });
    const api: LiquidHandle = {
      get index() {
        return s.a;
      },
      begin(to, dir) {
        s.tween?.kill();
        if (!s.ready) return;
        s.b = to;
        assign("B", to);
        U().uDir.value.set(dir[0], dir[1]);
        setP(0);
      },
      setProgress: (p) => setP(Math.max(0, Math.min(1, p))),
      async finish(commitIt) {
        const cur = U().uProgress.value as number;
        await run(commitIt ? 1 : 0, (commitIt ? 1 - cur : cur) * 1.4 + 0.25);
        if (commitIt) commit();
        else {
          s.b = s.a;
          assign("B", s.a);
        }
      },
      async go(to, dir = [0, -1], duration = 1.7) {
        if (!s.ready || to === s.a) return;
        api.begin(to, dir);
        await run(1, duration);
        commit();
      },
      scrub(v) {
        if (!s.ready) return;
        const n = frames.length - 1;
        const c = Math.max(0, Math.min(n, v));
        const i = Math.min(n - 1, Math.floor(c));
        const f = c - i;
        if (n < 1) return;
        if (s.a !== i) {
          s.a = i;
          assign("A", i);
        }
        if (s.b !== i + 1) {
          s.b = i + 1;
          assign("B", i + 1);
        }
        U().uDir.value.set(0, -1);
        const e = Math.min(1, Math.max(0, (f - 0.18) / 0.64)); // hold on each photo, pour in between
        setP(e * e * (3 - 2 * e));
      },
    };
    handleRef.current = api;
    return () => {
      s.tween?.kill();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, handleRef]);

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={initialUniforms} depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Average colour of a photo, sampled from a 16px thumbnail — used for the ambient glow. */
function averageColour(img: CanvasImageSource): THREE.Vector3 {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0, 16, 16);
    const d = g.getImageData(0, 0, 16, 16).data;
    let r = 0, gg = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      gg += d[i + 1];
      b += d[i + 2];
    }
    const k = 0.9 / (d.length / 4) / 255;
    return new THREE.Vector3(r * k, gg * k, b * k);
  } catch {
    return new THREE.Vector3(0.3, 0.22, 0.15);
  }
}

export default function LiquidStage(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop="demand"
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 1] }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          props.onFail?.();
        });
      }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
