import { createElement, useEffect, useRef, useState, type ReactNode } from "react";

/** Fades its children up once, the first time they scroll into view. */
export default function Reveal({ children, delay = 0, as = "div", className = "" }:
  { children: ReactNode; delay?: number; as?: "div" | "li" | "section"; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([x]) => { if (x.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return createElement(as, { ref, style: { transitionDelay: `${delay}ms` }, className: `reveal ${on ? "in" : ""} ${className}` }, children);
}
