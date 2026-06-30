import { useState, useEffect } from 'react';
import { FiCheck, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useToastStore } from '../store/useToastStore';

// ── Individual toast item ──
const VARIANTS = {
  success: { icon: FiCheck, color: 'rgba(34,197,94,0.9)', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.18)' },
  error:   { icon: FiAlertCircle, color: 'rgba(239,68,68,0.9)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)' },
  info:    { icon: FiInfo, color: 'rgba(147,130,255,0.9)', bg: 'rgba(147,130,255,0.08)', border: 'rgba(147,130,255,0.18)' },
};

const ToastItem = ({ toast, onDismiss }) => {
  const [prevToastId, setPrevToastId] = useState(toast.id);
  const [prevMessage, setPrevMessage] = useState(toast.message);
  const [isExiting, setIsExiting] = useState(false);

  if (toast.id !== prevToastId || toast.message !== prevMessage) {
    setPrevToastId(toast.id);
    setPrevMessage(toast.message);
    setIsExiting(false);
  }

  const v = VARIANTS[toast.variant] || VARIANTS.success;
  const Icon = v.icon;

  useEffect(() => {
    const autoClose = setTimeout(() => setIsExiting(true), 2700);
    return () => clearTimeout(autoClose);
  }, [toast.id, toast.message, toast.variant]);

  useEffect(() => {
    if (isExiting) {
      const remove = setTimeout(() => onDismiss(toast.id), 300);
      return () => clearTimeout(remove);
    }
  }, [isExiting, onDismiss, toast.id]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
      style={{
        background: 'rgba(18,18,18,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${v.border}`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: v.bg, border: `1px solid ${v.border}` }}
      >
        <Icon size={14} style={{ color: v.color }} />
      </div>
      <p className="text-[13px] font-semibold text-white/85 flex-1 min-w-0 leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => setIsExiting(true)}
        className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 transition-colors shrink-0"
      >
        <FiX size={13} />
      </button>
    </div>
  );
};

// ── Toast container — render once at app root ──
const Toast = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-28 md:bottom-28 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 w-[min(90vw,380px)] pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default Toast;

