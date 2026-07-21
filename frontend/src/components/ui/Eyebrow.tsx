import type { ReactNode } from "react";
import { EYEBROW } from "../../lib/uiClasses";

interface EyebrowProps {
  children: ReactNode;
}

export default function Eyebrow({ children }: EyebrowProps) {
  return <span className={EYEBROW}>{children}</span>;
}
