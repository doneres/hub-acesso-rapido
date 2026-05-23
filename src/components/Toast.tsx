import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, visible, onHide }) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, 2400);
    return () => clearTimeout(timer);
  }, [visible, onHide]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]
        flex items-center gap-2.5 px-5 py-3 rounded-2xl
        bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold
        shadow-2xl shadow-black/30
        transition-all duration-300 pointer-events-none select-none
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
      `}
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      {message}
    </div>
  );
};

export default Toast;
