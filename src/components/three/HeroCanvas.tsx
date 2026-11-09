"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, useTexture } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* The client's real cake, as a lit photographic plane (no fake mesh). */
/* ------------------------------------------------------------------ */

const CAKE_SRC = "/hero-cake.webp";
const CAKE_ASPECT = 1559 / 1452;

const cakeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Subtle studio light: a soft key from the upper-left that follows the pointer,
// plus a slow specular sweep across the glaze. Colours are only nudged, never repainted.
const cakeFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform vec2 uLight;
  uniform float uReveal;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    vec3 col = tex.rgb;
    float key = smoothstep(1.1, 0.0, distance(vUv, uLight));
    col *= 0.9 + 0.2 * key;
    float pos = mod(uTime * 0.06, 1.8) - 0.4;
    float sweep = smoothstep(0.09, 0.0, abs((vUv.x * 0.8 + vUv.y * 0.55) - pos - 0.3));
    col += sweep * 0.07 * (0.6 + col);
    col *= vec3(1.03, 1.0, 0.96);
    float a = tex.a * smoothstep(0.0, 1.0, uReveal);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

function Cake({ pointer }: { pointer: React.RefObject<THREE.Vector2> }) {
  const tex = useTexture(CAKE_SRC);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mat = useRef<THREE.ShaderMaterial>(null);
  const tmp = useMemo(() => new THREE.Vector2(), []);
  const uniforms = useMemo(
    () => ({ uMap: { value: tex }, uTime: { value: 0 }, uLight: { value: new THREE.Vector2(0.3, 0.8) }, uReveal: { value: 0 } }),
    [tex],
  );
  useFrame((_, dt) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.uTime.value += dt;
    u.uReveal.value = Math.min(1, u.uReveal.value + dt * 0.8);
    const p = pointer.current!;
    tmp.set(0.32 + p.x * 0.25, 0.78 + p.y * 0.15);
    u.uLight.value.lerp(tmp, 0.05);
  });
  const h = 2.35;
  const w = h * CAKE_ASPECT;
  return (
    // pivot at the bottom edge so the cake "sits" on the plate
    <group position={[0, 1.245, 0.55]} rotation={[-0.32, 0, 0]}>
      <mesh position={[0, h / 2 - 0.06, 0]} renderOrder={2}>
        <planeGeometry args={[w, h]} />
        <shaderMaterial
          ref={mat}
          vertexShader={cakeVertex}
          fragmentShader={cakeFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* --------------------------- Cake stand ----------------------------- */

function CakeStand() {
  const shadow = useShadowTexture();
  const profile = useMemo(
    () =>
      [
        [0, 0], [1.08, 0], [1.1, 0.05], [1.0, 0.1], [0.42, 0.2], [0.24, 0.34],
        [0.17, 0.62], [0.17, 0.9], [0.24, 1.04], [0.4, 1.12], [1.62, 1.17],
        [1.68, 1.205], [1.64, 1.245], [0, 1.245],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );
  return (
    <group>
      <mesh>
        <latheGeometry args={[profile, 128]} />
        <meshPhysicalMaterial color="#efe5d6" roughness={0.32} clearcoat={1} clearcoatRoughness={0.12} sheen={0.4} sheenColor="#fff4e2" />
      </mesh>
      <mesh position={[0, 1.205, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.675, 0.02, 16, 160]} />
        <meshStandardMaterial color="#c9a25e" metalness={1} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.09, 0.016, 12, 128]} />
        <meshStandardMaterial color="#c9a25e" metalness={1} roughness={0.25} />
      </mesh>
      {/* soft occlusion where the cake meets the plate */}
      <mesh position={[0, 1.25, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.45, 64]} />
        <meshBasicMaterial transparent opacity={0.4} depthWrite={false} map={shadow} toneMapped={false} />
      </mesh>
    </group>
  );
}

function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 10, 64, 64, 64);
    grd.addColorStop(0, "rgba(30,15,8,1)");
    grd.addColorStop(1, "rgba(30,15,8,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);
}

/* ------------------- Gold dust + floating pearls -------------------- */

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aScale;
  attribute float aSpeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * aSpeed, 6.0) - 0.5;
    p.x += sin(uTime * 0.3 + position.z * 3.0) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    // out-of-focus particles render larger and fainter — a cheap depth of field
    float blur = abs(depth - 8.0) * 0.55;
    gl_PointSize = aScale * uPixelRatio * (26.0 + blur * 22.0) / depth;
    vAlpha = smoothstep(-0.5, 0.6, p.y) * smoothstep(5.5, 3.5, p.y) * (0.9 / (1.0 + blur * 1.6));
  }
`;
const dustFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(1.0, 0.82, 0.55, a * vAlpha);
  }
`;

function GoldDust({ count = 220 }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
      scale[i] = 0.4 + Math.random() * 1.2;
      speed[i] = 0.04 + Math.random() * 0.12;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: dpr } }), [dpr]);
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });
  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={mat}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const PEARLS: [number, number, number, number][] = [
  [-2.3, 3.1, 0.6, 0.11], [2.25, 3.5, -0.4, 0.085], [-2.1, 1.6, 1.2, 0.07],
  [2.5, 1.5, 1.1, 0.12], [-2.8, 2.2, -1.2, 0.06], [1.2, 4.2, -1.4, 0.07], [0.0, 4.5, 0.8, 0.05],
];

function Pearls() {
  return (
    <>
      {PEARLS.map(([x, y, z, r], i) => (
        <Float key={i} speed={1.1 + i * 0.13} rotationIntensity={0.4} floatIntensity={0.9} floatingRange={[-0.12, 0.12]}>
          <mesh position={[x, y, z]}>
            <sphereGeometry args={[r, 32, 32]} />
            <meshStandardMaterial color="#e2bb74" metalness={0.85} roughness={0.22} envMapIntensity={1.6} emissive="#4a2c10" emissiveIntensity={0.35} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* --------------------------- Choreography --------------------------- */

function Rig({ pointer, children }: { pointer: React.RefObject<THREE.Vector2>; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  const portrait = aspect < 0.9;
  const dist = aspect < 0.62 ? 15.5 : aspect < 0.9 ? 12 : 10.4;
  const t0 = useRef(0);
  const look = useMemo(() => new THREE.Vector3(0, portrait ? 1.75 : 1.85, 0), [portrait]);
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    // start wide and high, then dolly in
    camera.position.set(0, 7.5, portrait ? 19 : 15);
  }, [camera, portrait]);

  useFrame((state, dt) => {
    t0.current += dt;
    const p = pointer.current!;
    target.set(p.x * 0.6, 4.6 + p.y * 0.3, dist);
    camera.position.lerp(target, Math.min(1, dt * 1.1));
    camera.lookAt(look);
    if (group.current) {
      const t = state.clock.elapsedTime;
      // slow showroom turn of the whole stand + gentle response to the pointer
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(t * 0.25) * 0.09 + p.x * 0.12, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -p.y * 0.035, 0.05);
    }
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ onReady }: { onReady?: () => void }) {
  const pointer = useRef(new THREE.Vector2());
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <>
      <ambientLight intensity={0.35} color="#ffe9cf" />
      <spotLight position={[-4, 8, 5]} angle={0.4} penumbra={1} intensity={60} color="#ffd9a8" />
      <pointLight position={[4, 3, -3]} intensity={12} color="#ffb98a" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffe6c4" position={[-4, 4, 3]} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#fff3e2" position={[4, 2, 2]} scale={[2, 5, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffcf8a" position={[0, 6, -3]} scale={3} />
      </Environment>
      <Rig pointer={pointer}>
        <CakeStand />
        <Cake pointer={pointer} />
        <Pearls />
      </Rig>
      <GoldDust />
      <ContactShadows position={[0, 0.001, 0]} opacity={0.5} scale={9} blur={2.6} far={3} frames={1} color="#5a2a48" />
    </>
  );
}

export default function HeroCanvas({ active, onReady }: { active: boolean; onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 26, near: 0.1, far: 60, position: [0, 7.5, 15] }}
      frameloop={active ? "always" : "never"}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Scene onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
