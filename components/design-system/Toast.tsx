import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const toastColors = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-yellow-500",
};

const toastIcons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  onClose,
  duration = 3000,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={twMerge(
        "fixed bottom-4 right-4 flex items-center gap-2 p-4 rounded-lg",
        "backdrop-blur-md bg-opacity-90 text-white shadow-xl",
        toastColors[type]
      )}
    >
      <span className="text-lg">{toastIcons[type]}</span>
      <p>{message}</p>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-75 transition-opacity"
      >
        ✕
      </button>
    </motion.div>
  );
};

interface ToastContextType {
  showToast: (props: Omit<ToastProps, "onClose">) => void;
}

export const ToastContext = React.createContext<ToastContextType>({
  showToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<
    Array<ToastProps & { id: number }>
  >([]);
  const nextId = React.useRef(0);

  const showToast = (props: Omit<ToastProps, "onClose">) => {
    const id = nextId.current++;
    setToasts((current) => [
      ...current,
      { ...props, id, onClose: () => removeToast(id) },
    ]);
  };

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default Toast;
