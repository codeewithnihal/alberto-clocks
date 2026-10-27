import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  startTransition,
  useState,
} from "react";

/**
 * Tiny hash router (#/collections/luxury?sort=price-asc).
 * Hash routing keeps the site a true single-page application that also works on
 * any static host without rewrite rules.
 */

const RouterContext = createContext(null);

function readLocation() {
  const raw = (typeof window !== "undefined" ? window.location.hash : "").replace(/^#/, "") || "/";
  const [pathPart, queryPart = ""] = raw.split("?");
  const path = `/${pathPart.replace(/^\/+/, "")}`.replace(/\/+$/, "") || "/";
  return { path, query: Object.fromEntries(new URLSearchParams(queryPart)) };
}

/** matchPath("/product/:id", "/product/luxury-001") -> { id: "luxury-001" } | null */
export function matchPath(pattern, path) {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) {
      try {
        params[a[i].slice(1)] = decodeURIComponent(b[i]);
      } catch {
        return null;
      }
    } else if (a[i] !== b[i]) return null;
  }
  return params;
}

/** Gold Reveal timings (ms). Keep in sync with the keyframes in src/styles/site.css (--gr-cover / --gr-reveal). */
export const TRANSITION_MS = { cover: 1000, reveal: 820 };

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Router({ routes, children }) {
  // `location` is what is rendered. On a real page change the URL (hash) changes first, the screen
  // is covered, and only then the new page is committed ("cover" -> "reveal" -> "idle").
  // Back/forward buttons use the same path, so they get the same transition.
  const [location, setLocation] = useState(readLocation);
  const [phase, setPhase] = useState("idle");
  const shownPath = useRef(location.path);
  const phaseRef = useRef("idle");
  const timers = useRef([]);

  const setPhaseBoth = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  // Page chunks are code-split. During the transition the next page's chunk is downloaded
  // behind the cover, so the reveal never shows a loading skeleton.
  const routesRef = useRef(routes);
  routesRef.current = routes;
  const preloadFor = (path) => {
    for (const route of routesRef.current) {
      if (matchPath(route.path, path)) return Promise.resolve(route.component?.preload?.()).catch(() => {});
    }
    return Promise.resolve();
  };
  const sleep = (ms) => new Promise((resolve) => timers.current.push(setTimeout(resolve, ms)));
  const token = useRef(0);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const commit = () => {
      const latest = readLocation();
      shownPath.current = latest.path;
      // A transition keeps the old page on screen (instead of a Suspense fallback) until the new one is ready.
      startTransition(() => setLocation(latest));
    };
    const onChange = async () => {
      const next = readLocation();
      const mine = ++token.current;
      const samePage = next.path === shownPath.current;

      // Same page (only the query changed): swap straight away.
      if (samePage) {
        if (phaseRef.current !== "reveal") {
          clear();
          if (phaseRef.current === "cover") setPhaseBoth("idle");
        }
        commit();
        return;
      }
      // Reduced motion, or a reveal is already running: no cover, but still wait for the chunk.
      if (prefersReducedMotion() || phaseRef.current === "reveal") {
        if (phaseRef.current !== "reveal") clear();
        await Promise.race([preloadFor(next.path), sleep(2500)]);
        if (token.current === mine) commit();
        return;
      }

      clear();
      setPhaseBoth("cover");
      await Promise.all([sleep(TRANSITION_MS.cover), Promise.race([preloadFor(next.path), sleep(2500)])]);
      if (token.current !== mine) return; // a newer navigation took over
      commit();
      setPhaseBoth("reveal");
      timers.current.push(setTimeout(() => setPhaseBoth("idle"), TRANSITION_MS.reveal));
    };
    window.addEventListener("hashchange", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      clear();
    };
  }, []);

  const match = useMemo(() => {
    for (const route of routes) {
      const params = matchPath(route.path, location.path);
      if (params) return { route, params };
    }
    return { route: null, params: {} };
  }, [routes, location.path]);

  const navigate = useCallback((to) => {
    window.location.hash = to.startsWith("/") ? to : `/${to}`;
  }, []);

  /** Update the query string without adding a history entry (filters, sort, search). */
  const setQuery = useCallback((next) => {
    const current = readLocation();
    const merged = { ...current.query, ...next };
    for (const key of Object.keys(merged)) if (merged[key] === "" || merged[key] == null) delete merged[key];
    const qs = new URLSearchParams(merged).toString();
    window.history.replaceState(null, "", `#${current.path}${qs ? `?${qs}` : ""}`);
    setLocation(readLocation());
  }, []);

  const value = useMemo(
    () => ({ ...location, params: match.params, route: match.route, navigate, setQuery, transition: phase }),
    [location, match, navigate, setQuery, phase]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside <Router>");
  return ctx;
}

/** Renders the matched page, resets scroll and moves focus to <main> on every navigation. */
export function RouteView({ fallback, notFound: NotFound }) {
  const { route, path } = useRouter();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [path]);

  const Page = route ? route.component : NotFound;
  return <Suspense fallback={fallback}>{Page ? <Page /> : null}</Suspense>;
}

/** <a href="#/path"> that marks itself with aria-current when active. */
export function Link({ to, exact = false, className, activeClassName, children, ...rest }) {
  const { path } = useRouter();
  const target = to.split("?")[0];
  const active = exact || target === "/" ? path === target : path === target || path.startsWith(`${target}/`);
  const classes = [className, active ? activeClassName : ""].filter(Boolean).join(" ") || undefined;
  return (
    <a href={`#${to}`} aria-current={active ? "page" : undefined} className={classes} {...rest}>
      {children}
    </a>
  );
}
