"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type ToastContextValue = {
  showToast: (message: string, options?: { duration?: number }) => void;
};

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string, options?: { duration?: number }) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      setOpen(true);
      timerRef.current = setTimeout(() => {
        setOpen(false);
      }, options?.duration ?? 3000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`toast${open ? " show" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span>{message}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
