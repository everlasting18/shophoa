import { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

type ToastType = "success" | "error";
interface Toast { id: number; message: string; type: ToastType }

const ToastContext = createContext<{ addToast: (message: string, type?: ToastType) => void }>({
  addToast: () => {},
});

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++nextId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-20 right-4 lg:bottom-5 lg:right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium pointer-events-auto animate-in slide-in-from-right-5 ${
              toast.type === "success"
                ? "bg-stone-900 border-emerald-500/30 text-emerald-400"
                : "bg-stone-900 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success"
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="text-white">{toast.message}</span>
            <button onClick={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
              className="text-stone-500 hover:text-white ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
