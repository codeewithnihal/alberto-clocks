import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { CheckCircle2, AlertTriangle, Info, XOctagon, X } from "lucide-react";

const alertToastVariants = cva(
  "relative flex w-full max-w-sm items-start space-x-4 overflow-hidden rounded-lg p-4 shadow-lg",
  {
    variants: {
      variant: { success: "", warning: "", info: "", error: "" },
      styleVariant: {
        // Fixed: the default style now uses the normal foreground colour. The original
        // applied `text-*-foreground` (white-ish) on a `bg-background` surface, which
        // made the text unreadable.
        default: "border bg-background text-foreground",
        filled: "",
      },
    },
    compoundVariants: [
      { variant: "success", styleVariant: "default", className: "border-green-200 dark:border-green-700" },
      { variant: "warning", styleVariant: "default", className: "border-yellow-200 dark:border-yellow-700" },
      { variant: "info", styleVariant: "default", className: "border-blue-200 dark:border-blue-700" },
      { variant: "error", styleVariant: "default", className: "border-red-200 dark:border-red-700" },
      { variant: "success", styleVariant: "filled", className: "bg-success text-success-foreground" },
      { variant: "warning", styleVariant: "filled", className: "bg-warning text-warning-foreground" },
      { variant: "info", styleVariant: "filled", className: "bg-info text-info-foreground" },
      { variant: "error", styleVariant: "filled", className: "bg-destructive text-destructive-foreground" },
    ],
    defaultVariants: { variant: "info", styleVariant: "default" },
  }
);

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XOctagon,
};

const iconColorClasses = {
  default: {
    success: "text-green-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    error: "text-red-500",
  },
  filled: {
    success: "text-success-foreground",
    warning: "text-warning-foreground",
    info: "text-info-foreground",
    error: "text-destructive-foreground",
  },
};

/**
 * Animated alert toast.
 *
 * Props:
 *  - variant       "success" | "warning" | "info" | "error"
 *  - styleVariant  "default" | "filled"
 *  - title         string
 *  - description   string
 *  - onClose       () => void
 *
 * To get the exit animation, render it inside framer-motion's <AnimatePresence>:
 *   <AnimatePresence>{open && <AlertToast key="t" ... />}</AnimatePresence>
 */
const AlertToast = React.forwardRef(
  (
    { className, variant = "info", styleVariant = "default", title, description, onClose, ...props },
    ref
  ) => {
    const Icon = iconMap[variant] ?? Info;

    return (
      <motion.div
        ref={ref}
        role={variant === "error" || variant === "warning" ? "alert" : "status"}
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.5 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={cn(alertToastVariants({ variant, styleVariant }), className)}
        {...props}
      >
        <div className="flex-shrink-0">
          <Icon
            className={cn("h-6 w-6", iconColorClasses[styleVariant]?.[variant])}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>

        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "rounded-full p-1 opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
              styleVariant === "default" ? "text-foreground/70 hover:bg-muted" : "hover:bg-black/20"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );
  }
);
AlertToast.displayName = "AlertToast";

export { AlertToast, alertToastVariants };
export default AlertToast;
