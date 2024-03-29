// https://www.joshwcomeau.com/react/prefers-reduced-motion/
import { useState, useEffect } from "react";

const QUERY = "(prefers-reduced-motion: no-preference)";
const getInitialState = (): boolean => !window.matchMedia(QUERY).matches;

export default function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(getInitialState);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    function listener(event: MediaQueryListEvent): void {
      setPrefersReducedMotion(!event.matches);
    }
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, []);

  return prefersReducedMotion;
}
