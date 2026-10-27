import * as React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { cn } from "../lib/utils";
import { InteractiveHoverButton } from "./HoverEffectButton";
import { LIMITS, validateAll, validators } from "../lib/validation";

const smoothEase = [0.25, 0.1, 0.25, 1];

// Placeholder contact details. Replace them or pass your own via the `contactLinks` prop.
const DEFAULT_CONTACT_LINKS = [
  { icon: Mail, label: "hello@example.com", href: "mailto:hello@example.com" },
  { icon: Phone, label: "+1 (555) 010-0100", href: "tel:+15550100100" },
];

const WORLD_ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// [latitude, longitude]
const cityCoordinates = {
  "san francisco": [37.7749, -122.4194],
  "new york": [40.7128, -74.006],
  london: [51.5074, -0.1278],
  tokyo: [35.6762, 139.6503],
  paris: [48.8566, 2.3522],
  moscow: [55.7558, 37.6176],
  dubai: [25.2048, 55.2708],
  singapore: [1.3521, 103.8198],
  sydney: [-33.8688, 151.2093],
  mumbai: [19.076, 72.8777],
  "los angeles": [34.0522, -118.2437],
  chicago: [41.8781, -87.6298],
};

// Module-level constants so default props keep a stable identity between renders
// (a fresh `[]` default re-triggered effects on every render in the original).
const NO_CITIES = [];
const DEFAULT_ROTATION = [0, 0];

// =========================================
// Globe
// =========================================

function orthographicRaw(x, y) {
  const cosy = Math.cos(y);
  return [cosy * Math.sin(x), Math.sin(y)];
}

function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}

/** A projection that blends between two raw projections via `.alpha(t)` (0 = first, 1 = second). */
function interpolateProjection(raw0, raw1) {
  let t = 0;

  const createRawProjection = (alpha) => (lambda, phi) => {
    const [x0, y0] = raw0(lambda, phi);
    const [x1, y1] = raw1(lambda, phi);
    return [x0 + alpha * (x1 - x0), y0 + alpha * (y1 - y0)];
  };

  const projection = d3.geoProjection(createRawProjection(t));

  const alphaMethod = (value) => {
    if (value !== undefined) {
      t = +value;
      const next = d3.geoProjection(createRawProjection(t));
      if (projection.scale()) next.scale(projection.scale());
      if (projection.translate()) next.translate(projection.translate());
      if (projection.rotate()) next.rotate(projection.rotate());
      if (projection.precision()) next.precision(projection.precision());
      next.alpha = alphaMethod;
      return next;
    }
    return t;
  };

  projection.alpha = alphaMethod;
  return projection;
}

function GlobeWireframe({
  width,
  height,
  className = "aspect-square w-full max-w-[600px]", // fixed: `max-w-150` is not a Tailwind v3 class
  strokeColor = "currentColor",
  strokeWidth = 1.0,
  graticuleColor = "currentColor",
  graticuleOpacity = 0.2,
  sphereOutlineColor = "currentColor",
  sphereOutlineWidth = 1,
  autoRotate = true,
  autoRotateSpeed = 0.5,
  rotateToLocation,
  rotateCities = NO_CITIES,
  rotationSpeed = 3000,
  initialRotation = DEFAULT_ROTATION,
  enableInteraction = true,
  showGraticule = true,
  startAsGlobe = true,
  countryFillColor,
  countryHoverColor,
  variant = "wireframe",
  scale = 1,
  backgroundColor,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [progress] = useState(startAsGlobe ? 0 : 100);
  const [worldData, setWorldData] = useState([]);
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState([0, 0]);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const rotationAnimFrame = useRef(null);
  const autoRotateFrame = useRef(null);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const useResponsive = !width && !height;
  const finalWidth = useResponsive ? dimensions.width : width || 800;
  const finalHeight = useResponsive ? dimensions.height : height || 500;

  const defaultCountryFillColor =
    countryFillColor || (variant === "solid" ? "currentColor" : "none");
  const defaultBackgroundColor = backgroundColor || "transparent";

  // Size + visibility tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateDimensions = () => {
      if (useResponsive) {
        const measured = container.offsetWidth || 300;
        setDimensions({ width: measured, height: measured });
      }
    };
    updateDimensions();

    let resizeObserver;
    if (useResponsive) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(container);
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    intersectionObserver.observe(container);

    return () => {
      resizeObserver?.disconnect();
      intersectionObserver.disconnect();
    };
  }, [useResponsive]);

  // Load country shapes
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(WORLD_ATLAS_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const world = await response.json();
        setWorldData(feature(world, world.objects.countries).features);
      } catch (error) {
        if (error.name === "AbortError") return;
        // The original fell back to a world-sized rectangle that rendered as a
        // broken shape. With no data we simply draw the sphere outline.
        console.error("Error loading world data:", error);
        setWorldData([]);
      }
    })();

    return () => controller.abort();
  }, []);

  // Idle auto-rotation
  useEffect(() => {
    if (!autoRotate || !isVisible || isDragging || rotateCities.length > 0) return undefined;

    const rotate = () => {
      setRotation((prev) => [(prev[0] + autoRotateSpeed) % 360, prev[1]]);
      autoRotateFrame.current = requestAnimationFrame(rotate);
    };
    autoRotateFrame.current = requestAnimationFrame(rotate);

    return () => {
      if (autoRotateFrame.current) cancelAnimationFrame(autoRotateFrame.current);
    };
  }, [autoRotate, autoRotateSpeed, isVisible, isDragging, rotateCities.length]);

  const animateRotationTo = useCallback((target, duration = 1200) => {
    if (rotationAnimFrame.current) cancelAnimationFrame(rotationAnimFrame.current);

    const from = rotationRef.current;
    const startTime = performance.now();

    const animate = (time) => {
      const t = Math.min((time - startTime) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setRotation([
        from[0] + (target[0] - from[0]) * eased,
        from[1] + (target[1] - from[1]) * eased,
      ]);
      if (t < 1) rotationAnimFrame.current = requestAnimationFrame(animate);
    };

    rotationAnimFrame.current = requestAnimationFrame(animate);
  }, []);

  // Cycle through cities. Fixed: the original kept the current index in state and listed it
  // as an effect dependency, so every step tore down and re-created the interval and
  // restarted the animation twice.
  useEffect(() => {
    if (rotateCities.length === 0 || !isVisible) return undefined;

    let index = 0;
    const goTo = (i) => {
      const coordinates = cityCoordinates[rotateCities[i].toLowerCase()];
      if (coordinates) {
        animateRotationTo([-coordinates[1], -coordinates[0]], rotationSpeed * 0.6);
      }
    };

    goTo(index);
    const interval = setInterval(() => {
      index = (index + 1) % rotateCities.length;
      goTo(index);
    }, rotationSpeed);

    return () => clearInterval(interval);
  }, [rotateCities, rotationSpeed, isVisible, animateRotationTo]);

  // Jump to a fixed location
  useEffect(() => {
    if (!rotateToLocation) return;
    const coordinates =
      typeof rotateToLocation === "string"
        ? cityCoordinates[rotateToLocation.toLowerCase()] || [0, 0]
        : rotateToLocation;
    setRotation([-coordinates[1], -coordinates[0]]);
  }, [rotateToLocation]);

  // Stop any running animation frames on unmount
  useEffect(
    () => () => {
      if (rotationAnimFrame.current) cancelAnimationFrame(rotationAnimFrame.current);
      if (autoRotateFrame.current) cancelAnimationFrame(autoRotateFrame.current);
    },
    []
  );

  // Pointer events (the original used mouse events only, so touch screens could not drag).
  const handlePointerDown = (event) => {
    if (!enableInteraction) return;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) setLastMouse([event.clientX - rect.left, event.clientY - rect.top]);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !enableInteraction) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentMouse = [event.clientX - rect.left, event.clientY - rect.top];
    const dx = currentMouse[0] - lastMouse[0];
    const dy = currentMouse[1] - lastMouse[1];

    const t = progress / 100;
    const sensitivity = variant === "wireframe" ? (t < 0.5 ? 0.5 : 0.25) : 0.5;

    setRotation((prev) => [
      prev[0] + dx * sensitivity,
      Math.max(-90, Math.min(90, prev[1] - dy * sensitivity)),
    ]);
    setLastMouse(currentMouse);
  };

  const handlePointerEnd = (event) => {
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  // Draw
  useEffect(() => {
    if (!svgRef.current || !isVisible) return;
    if (useResponsive && dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    let finalCountryFill = "none";
    let finalStrokeWidth = strokeWidth;
    let finalOpacity = 1.0;
    let renderGraticule = showGraticule;
    let finalGraticuleOpacity = graticuleOpacity;
    let finalSphereOutlineWidth = sphereOutlineWidth;

    if (variant === "wireframesolid") {
      renderGraticule = false;
      finalGraticuleOpacity = 0;
      finalSphereOutlineWidth = 1.5;
    } else if (variant === "solid") {
      finalCountryFill = defaultCountryFillColor;
      finalStrokeWidth = strokeWidth * 0.5;
      finalOpacity = 0.3;
      renderGraticule = false;
      finalGraticuleOpacity = 0;
      finalSphereOutlineWidth = 1.5;
    }

    if (defaultBackgroundColor !== "transparent") {
      const radius = (Math.min(finalWidth, finalHeight) / 2) * scale * 0.9;
      svg
        .append("circle")
        .attr("cx", finalWidth / 2)
        .attr("cy", finalHeight / 2)
        .attr("r", radius)
        .attr("fill", defaultBackgroundColor);
    }

    let projection;
    const path = d3.geoPath();

    if (variant === "wireframe") {
      const t = progress / 100;
      const alpha = Math.pow(t, 0.5);
      const baseScale = Math.min(finalWidth, finalHeight) / 2;
      const scaleRange = d3
        .scaleLinear()
        .domain([0, 1])
        .range([baseScale * 0.9 * scale, baseScale * 0.54 * scale]);

      projection = interpolateProjection(orthographicRaw, equirectangularRaw)
        .scale(scaleRange(alpha))
        .translate([finalWidth / 2, finalHeight / 2])
        .rotate([rotation[0], rotation[1]])
        .precision(0.1);

      projection.alpha(alpha);
      path.projection(projection);
    } else {
      projection = d3
        .geoOrthographic()
        .scale((Math.min(finalWidth, finalHeight) / 2) * scale * 0.9)
        .translate([finalWidth / 2, finalHeight / 2])
        .rotate([rotation[0], rotation[1]])
        .precision(0.1);
      path.projection(projection);
    }

    if (renderGraticule && finalGraticuleOpacity > 0) {
      try {
        const graticule = d3.geoGraticule();
        const graticulePath = path(graticule());
        if (graticulePath) {
          svg
            .append("path")
            .datum(graticule())
            .attr("d", graticulePath)
            .attr("fill", "none")
            .attr("stroke", graticuleColor)
            .attr("stroke-width", 1)
            .attr("opacity", finalGraticuleOpacity);
        }
      } catch (error) {
        console.error("Error creating graticule:", error);
      }
    }

    svg
      .selectAll(".country")
      .data(worldData)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", (d) => {
        try {
          const pathString = path(d);
          if (!pathString || pathString.includes("NaN") || pathString.includes("Infinity")) {
            return "";
          }
          return pathString;
        } catch {
          return "";
        }
      })
      .attr("fill", finalCountryFill)
      .attr("stroke", strokeColor)
      .attr("stroke-width", finalStrokeWidth)
      .attr("opacity", finalOpacity)
      .on("mouseenter", function () {
        if (countryHoverColor && variant === "solid") {
          d3.select(this).attr("fill", countryHoverColor);
        }
      })
      .on("mouseleave", function () {
        if (variant === "solid") d3.select(this).attr("fill", finalCountryFill);
      });

    try {
      const sphereOutline = path({ type: "Sphere" });
      if (sphereOutline) {
        svg
          .append("path")
          .datum({ type: "Sphere" })
          .attr("d", sphereOutline)
          .attr("fill", "none")
          .attr("stroke", sphereOutlineColor)
          .attr("stroke-width", finalSphereOutlineWidth)
          .attr("opacity", variant === "wireframe" ? 1.0 : 0.8);
      }
    } catch (error) {
      console.error("Error creating sphere outline:", error);
    }
  }, [
    worldData,
    progress,
    rotation,
    isVisible,
    finalWidth,
    finalHeight,
    strokeColor,
    strokeWidth,
    graticuleColor,
    graticuleOpacity,
    sphereOutlineColor,
    sphereOutlineWidth,
    showGraticule,
    defaultCountryFillColor,
    countryHoverColor,
    variant,
    scale,
    defaultBackgroundColor,
    useResponsive,
    dimensions.width,
  ]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={finalWidth}
        height={finalHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className={useResponsive ? "h-full w-full transition-opacity duration-1000" : ""}
        aria-hidden="true"
        style={{
          cursor: enableInteraction ? (isDragging ? "grabbing" : "grab") : "default",
          // pan-y keeps vertical page scrolling working on touch devices.
          touchAction: enableInteraction ? "pan-y" : "auto",
          opacity: useResponsive ? (dimensions.width > 0 ? 1 : 0) : 1,
        }}
      />
    </div>
  );
}

// =========================================
// Dotted separator
// =========================================

const FormDots = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
    const isHorizontal = orientation === "horizontal";
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden",
          isHorizontal ? "w-full" : "h-full",
          className
        )}
        {...props}
      >
        <div className={cn("relative", isHorizontal ? "h-4 w-full" : "h-full w-4")}>
          <div
            className="absolute inset-0 bg-repeat text-neutral-400 dark:text-white/20"
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 0.8px, transparent 0.8px)",
              backgroundSize: isHorizontal ? "6px 100%" : "100% 6px",
              maskImage: isHorizontal
                ? "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
                : "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          />
        </div>
      </SeparatorPrimitive.Root>
    );
  }
);
FormDots.displayName = "FormDots";

// =========================================
// Contact section
// =========================================

const INITIAL_FORM = { name: "", company: "", email: "", subject: "", message: "" };

const labelClass =
  "text-xs font-medium tracking-wide text-muted-foreground";

const fieldClass =
  "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

/**
 * Contact section with details, a rotating wireframe globe and a working form.
 *
 * Props:
 *  - title, subtitle, description   header copy
 *  - contactLinks   { icon, label, href }[]
 *  - onSubmit       async (values) => { message? } | void. Values are trimmed and already validated
 *                   (src/lib/validation.js). Throw to show an error message.
 *                   Without it the form just shows the success state (no request is sent).
 *  - className
 */
export default function ContactForm({
  title = "Contact us",
  subtitle = "Contact",
  description = "We are always looking for ways to improve our products and services. Contact us and let us know how we can help you.",
  contactLinks = DEFAULT_CONTACT_LINKS,
  onSubmit,
  className,
}) {
  const uid = useId();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [resultMessage, setResultMessage] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [summary, setSummary] = useState("");
  const formRef = useRef(null);

  // Validate one field and keep its error in sync (used on blur and while typing).
  const check = (name, value) => setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status === "sent" || status === "error") setStatus("idle");
    // Once a field has been visited (or a submit was attempted) errors update as the user types,
    // so a fixed error disappears immediately.
    if (touched[name]) check(name, value);
  };
  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    check(name, value);
  };

  // Fixed: the original had no <form>, no state and a Submit button that did nothing.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;
    const found = validateAll(form);
    setErrors(found);
    setTouched({ name: true, company: true, email: true, subject: true, message: true });
    const invalid = Object.keys(found);
    if (invalid.length) {
      setSummary(`Please correct ${invalid.length} ${invalid.length === 1 ? "field" : "fields"} before sending.`);
      setStatus("idle");
      formRef.current?.elements[invalid[0]]?.focus();
      return;
    }
    setSummary("");
    setStatus("sending");
    try {
      const clean = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
      const result = await onSubmit?.(clean);
      setResultMessage(result?.message ?? "");
      setForm(INITIAL_FORM);
      setErrors({});
      setTouched({});
      setStatus("sent");
    } catch (error) {
      console.error("Contact form submit failed:", error);
      setStatus("error");
    }
  };

  // Shared props for every field: id, label link, error wiring, live validation.
  const field = (name, extra = {}) => ({
    id: `${uid}-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-error` : undefined,
    className: cn(fieldClass, errors[name] && "border-destructive focus:border-destructive focus:ring-destructive/20", extra.className),
    ...extra,
  });
  const fieldError = (name) =>
    errors[name] ? (
      <p id={`${uid}-${name}-error`} className="text-xs text-destructive">
        {errors[name]}
      </p>
    ) : null;

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-background py-20",
        className
      )}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
          >
            <span className="text-sm font-medium text-primary">{subtitle}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: smoothEase }}
            className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: smoothEase }}
            className="max-w-md text-base text-muted-foreground"
          >
            {description}
          </motion.p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-10 lg:grid-cols-2">
          {/* Left column: details + globe */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.2, ease: smoothEase }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold text-foreground">Get in touch</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Reach out via any channel below. We typically reply within one business day.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {contactLinks.map(({ icon: Icon, label, href }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: smoothEase }}
                  className="group flex w-fit items-center gap-3 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted transition-all duration-200 group-hover:border-primary/50 group-hover:bg-primary/10">
                    {Icon && (
                      <Icon className="h-3.5 w-3.5 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
                    )}
                  </div>
                  {label}
                </motion.a>
              ))}
            </div>

            <div className="relative h-52 overflow-hidden">
              <GlobeWireframe
                className="absolute left-0 top-0 aspect-square w-full max-w-full text-foreground"
                variant="wireframesolid"
                autoRotate
                autoRotateSpeed={0.45}
                strokeWidth={0.6}
                graticuleOpacity={0.12}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
            </div>
          </motion.div>

          {/* Right column: form */}
          <motion.form
            ref={formRef}
            noValidate
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.35, ease: smoothEase }}
            className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <div>
              <h3 className="mb-0.5 text-lg font-semibold text-foreground">
                Send a message
              </h3>
              <p className="text-sm text-muted-foreground">
                Fill out the form and we&apos;ll get back to you promptly.
              </p>
            </div>

            <FormDots />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor={`${uid}-name`} className={labelClass}>
                  Full Name <span aria-hidden="true">*</span>
                </label>
                <input {...field("name")} type="text" autoComplete="name" required aria-required="true" maxLength={LIMITS.name.max + 20} placeholder="Your name" />
                {fieldError("name")}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={`${uid}-company`} className={labelClass}>
                  Company
                </label>
                <input {...field("company")} type="text" autoComplete="organization" maxLength={LIMITS.company.max + 20} placeholder="Optional" />
                {fieldError("company")}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={`${uid}-email`} className={labelClass}>
                Email Address <span aria-hidden="true">*</span>
              </label>
              <input {...field("email")} type="email" autoComplete="email" inputMode="email" required aria-required="true" placeholder="you@example.com" />
              {fieldError("email")}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={`${uid}-subject`} className={labelClass}>
                Subject <span aria-hidden="true">*</span>
              </label>
              <input {...field("subject")} type="text" required aria-required="true" maxLength={LIMITS.subject.max + 20} placeholder="How can we help?" />
              {fieldError("subject")}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={`${uid}-message`} className={labelClass}>
                Message <span aria-hidden="true">*</span>
              </label>
              <textarea {...field("message", { className: cn(fieldClass, "resize-none py-3", errors.message && "border-destructive focus:border-destructive focus:ring-destructive/20") })} rows={4} required aria-required="true" placeholder="Type your message here" />
              <div className="flex items-start justify-between gap-3">
                <div>{fieldError("message")}</div>
                <p className={cn("ml-auto shrink-0 text-xs tabular-nums text-muted-foreground", form.message.trim().length > LIMITS.message.max && "text-destructive")} aria-hidden="true">
                  {form.message.trim().length} / {LIMITS.message.max}
                </p>
              </div>
            </div>

            {summary && (
              <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <InteractiveHoverButton
                type="submit"
                text={status === "sending" ? "Sending…" : "Send message"}
                disabled={status === "sending"}
                className="w-44"
              />

              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "text-sm",
                  status === "sent" && "text-foreground",
                  status === "error" && "text-destructive"
                )}
              >
                {status === "sent" && (resultMessage || "Thank you! Your message has been sent.")}
                {status === "error" && "Something went wrong. Please try again."}
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

export { ContactForm };
