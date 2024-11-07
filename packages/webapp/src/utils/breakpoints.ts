import { useEffect, useMemo, useState } from "react";

type BreakpointName = "sm" | "md" | "lg" | "xl" | "2xl";

type Breakpoint = {
  name: BreakpointName;
  minWidth: number;
};

const BREAKPOINTS: Breakpoint[] = [
  { name: "sm", minWidth: 640 },
  { name: "md", minWidth: 768 },
  { name: "lg", minWidth: 1024 },
  { name: "xl", minWidth: 1200 },
  { name: "2xl", minWidth: 1512 },
];

export function useIsDesktop() {
  return useActiveBreakpoints(["sm"]);
}

export function useActiveBreakpoints(breakpoints: BreakpointName[]) {
  const [activeBreakpoints, setActiveBreakpoints] = useState(
    new Set<BreakpointName>()
  );

  useEffect(() => {
    const mediaMatchers: MediaQueryList[] = [];

    function handleBreakpointChange() {
      const checks = new Set<BreakpointName>();
      for (const b of BREAKPOINTS) {
        const { matches } = window.matchMedia(`(min-width: ${b.minWidth}px)`);
        if (matches) {
          checks.add(b.name);
        }
      }
      setActiveBreakpoints(checks);
    }

    // Create listeners for each breakpoint
    for (const b of BREAKPOINTS) {
      const matcher = window.matchMedia(`(min-width: ${b.minWidth}px)`);
      mediaMatchers.push(matcher);
      matcher.addEventListener("change", handleBreakpointChange);
    }

    // Cleanup listeners on component unmount
    return () => {
      mediaMatchers.forEach((mql) =>
        mql.removeEventListener("change", handleBreakpointChange)
      );
    };
  }, []);

  const areAllActive = useMemo(() => {
    for (const b of breakpoints) {
      if (!activeBreakpoints.has(b)) {
        return false;
      }
    }
    return true;
  }, [activeBreakpoints, breakpoints]);

  return areAllActive;
}
