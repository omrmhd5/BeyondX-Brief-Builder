import type { ReactNode } from "react";
import { BEZEL_INNER, BEZEL_OUTER, MOTION } from "../../lib/uiClasses";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface BezelCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  reveal?: boolean;
  revealDelay?: number;
}

export default function BezelCard({
  children,
  className = "",
  innerClassName = "",
  reveal = true,
  revealDelay = 0,
}: BezelCardProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  const motion = reveal
    ? `${MOTION} ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`
    : "";

  return (
    <div
      ref={reveal ? ref : undefined}
      className={`${BEZEL_OUTER} ${motion} ${className}`}
      style={reveal ? { transitionDelay: `${revealDelay}ms` } : undefined}>
      <div className={`${BEZEL_INNER} ${innerClassName}`}>{children}</div>
    </div>
  );
}
