import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertToast } from "../components/ToastNotification";

const ToastContext = createContext(null);
const MAX_TOASTS = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** push({ variant: "success" | "info" | "warning" | "error", title, description, duration }) */
  const push = useCallback(
    ({ duration = 3500, ...toast }) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, ...toast }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => (
            <AlertToast
              key={toast.id}
              variant={toast.variant ?? "info"}
              title={toast.title}
              description={toast.description}
              onClose={() => dismiss(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
