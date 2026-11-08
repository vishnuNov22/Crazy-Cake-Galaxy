import { Fragment, type ElementType, type ReactNode } from "react";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Words (by index) wrapped in an accent span, e.g. italic gold. */
  accent?: number[];
  accentClassName?: string;
  /** Insert a line break before these word indices. */
  breaks?: number[];
  "data-split"?: boolean;
};

/**
 * Splits text into masked words → characters for GSAP split-text reveals.
 * The full string stays available to screen readers via aria-label.
 */
export function SplitText({
  text,
  as: Tag = "span",
  className,
  accent = [],
  accentClassName = "italic text-gold",
  breaks = [],
  "data-split": split,
}: Props) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text} data-split={split ? "" : undefined}>
      {words.map((word, wi) => {
        const chars: ReactNode = word.split("").map((ch, ci) => (
          <span key={ci} className="split-char inline-block will-change-transform">
            {ch}
          </span>
        ));
        return (
          <Fragment key={wi}>
            {breaks.includes(wi) && <br />}
            <span aria-hidden className="split-word inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
              <span className={accent.includes(wi) ? accentClassName : undefined}>{chars}</span>
            </span>
            {wi < words.length - 1 && <span aria-hidden> </span>}
          </Fragment>
        );
      })}
    </Tag>
  );
}
