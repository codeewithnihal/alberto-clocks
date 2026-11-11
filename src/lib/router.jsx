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
 * Clean path router (/collections/luxury?sort=price-asc).
 * Uses the HTML5 History API for standard clean URLs, supporting direct visits,
 * refreshes, and browser back/forward navigation.
 */

const RouterContext = createContext(null);

function readLocation() {
  if (typeof window === "undefined") {
    return { path: "/", query: {} };
  }

  // Backward compatibility: seamlessly redirect legacy hash URLs (e.g. /#/about or /#about)
  const hash = window.location.hash;
  if (hash && (hash.startsWith("#/") || (hash.startsWith("#") && !hash.startsWith("#main")))) {
    const hashContent = hash.replace(/^#\/?/, "");
    const [hPath, hQuery = ""] = hashContent.split("?");
    if (hPath && !hPath.includes("=") && hPath !== "main") {
      const clean = `/${hPath.replace(/^\/+/, "")}`;
      const search = hQuery ? `?${hQuery}` : window.location.search;
      window.history.replaceState(null, "", `${clean}${search}`);
    }
  }

  const raw = window.location.pathname || "/";
  const normalized = raw === "/" ? "/" : `/${raw.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  const query = Object.fromEntries(new URLSearchParams(window.location.search));
  return { path: normalized, query };
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
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Router({ routes, children }) {
  const [location, setLocation] = useState(readLocation);
  const [phase, setPhase] = useState("idle");
  const shownPath = useRef(location.path);
  const phaseRef = useRef("idle");
  const timers = useRef([]);

  const setPhaseBoth = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const routesRef = useRef(routes);
  routesRef.current = routes;
  const preloadFor = (path) => {
    for (const route of routesRef.current) {
      if (matchPath(route.path, path))
        return Promise.resolve(route.component?.preload?.()).catch(() => {});
    }
    return Promise.resolve();
  };
  const sleep = (ms) =>
    new Promise((resolve) => timers.current.push(setTimeout(resolve, ms)));
  const token = useRef(0);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const commit = () => {
      const latest = readLocation();
      shownPath.current = latest.path;
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
      await Promise.all([
        sleep(TRANSITION_MS.cover),
        Promise.race([preloadFor(next.path), sleep(2500)]),
      ]);
      if (token.current !== mine) return;
      commit();
      setPhaseBoth("reveal");
      timers.current.push(
        setTimeout(() => setPhaseBoth("idle"), TRANSITION_MS.reveal),
      );
    };

    window.addEventListener("popstate", onChange);

    // Delegated click listener for client-side routing on standard clean links
    const onDocumentClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }
      const anchor = event.target.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("rel") === "external") return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      // Preserve in-page section jumps (e.g. #main skip link)
      if (href.startsWith("#")) return;
      // External protocols
      if (/^(https?:|mailto:|tel:|\/\/)/i.test(href)) {
        try {
          const url = new URL(href, window.location.origin);
          if (url.origin !== window.location.origin) return;
          event.preventDefault();
          const target = `${url.pathname}${url.search}${url.hash}`;
          if (target !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
            window.history.pushState(null, "", target);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }
        } catch {
          return;
        }
        return;
      }

      event.preventDefault();
      const target = href.startsWith("/") ? href : `/${href}`;
      const current = `${window.location.pathname}${window.location.search}`;
      if (target !== current) {
        window.history.pushState(null, "", target);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    };

    document.addEventListener("click", onDocumentClick);

    return () => {
      window.removeEventListener("popstate", onChange);
      document.removeEventListener("click", onDocumentClick);
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

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (typeof window === "undefined") return;
    const target = to.startsWith("/") ? to : `/${to}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (target === current) return;
    if (replace) {
      window.history.replaceState(null, "", target);
    } else {
      window.history.pushState(null, "", target);
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  /** Update the query string without adding a history entry (filters, sort, search). */
  const setQuery = useCallback((next) => {
    const current = readLocation();
    const merged = { ...current.query, ...next };
    for (const key of Object.keys(merged)) {
      if (merged[key] === "" || merged[key] == null) delete merged[key];
    }
    const qs = new URLSearchParams(merged).toString();
    const url = `${current.path}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const value = useMemo(
    () => ({
      ...location,
      params: match.params,
      route: match.route,
      navigate,
      setQuery,
      transition: phase,
    }),
    [location, match, navigate, setQuery, phase],
  );

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
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
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    window.AOS?.refresh();
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [path]);

  const Page = route ? route.component : NotFound;
  return <Suspense fallback={fallback}>{Page ? <Page /> : null}</Suspense>;
}

/** <a href="/path"> that marks itself with aria-current when active. */
export function Link({
  to,
  exact = false,
  className,
  activeClassName,
  children,
  onClick,
  ...rest
}) {
  const { path } = useRouter();
  const target = to.split("?")[0];
  const active =
    exact || target === "/"
      ? path === target
      : path === target || path.startsWith(`${target}/`);
  const classes =
    [className, active ? activeClassName : ""].filter(Boolean).join(" ") ||
    undefined;
  return (
    <a
      href={to}
      aria-current={active ? "page" : undefined}
      className={classes}
      onClick={onClick}
      {...rest}
    >
      {children}
    </a>
  );
}
