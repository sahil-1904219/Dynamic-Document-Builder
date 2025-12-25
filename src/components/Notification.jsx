import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

export const Notification = ({ message, onClose, darkMode }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`
        fixed right-6 top-12
        flex items-center gap-3
        px-5 py-3
        rounded-md border
        shadow-lg
        z-50 text-sm font-medium
        transition-all duration-300
        ${darkMode
          ? "bg-slate-800 border-slate-700 text-slate-100"
          : "bg-white border-slate-200 text-slate-800"}
      `}
    >
      <CheckCircle
        className={`w-5 h-5 ${
          darkMode ? "text-emerald-400" : "text-emerald-600"
        }`}
      />
      <span>{message}</span>
    </div>
  );
};


