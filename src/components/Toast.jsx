import { useState, useEffect } from 'react';
import { FiCheck, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useToastStore } from '../store/useToastStore';

const VARIANTS = {
  success: { icon: FiCheck,       color: '#a99aff', bg: 'rgba(124,111,247,0.12)', border: 'rgba(124,111,247,0.3)' },
  error:   { icon: FiAlertCircle, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.3)'  },
  info:    { icon: FiInfo,        color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',   border: 'rgba(56,189,248,0.3)' },
};

const ToastItem = ({ toast, onDismiss }) => {
  const [prevId, setPrevId]     = useState(toast.id);
  const [prevMsg, setPrevMsg]   = useState(toast.message);
  const [exiting, setExiting]   = useState(false);

  if (toast.id !== prevId || toast.message !== prevMsg) {
    setPrevId(toast.id);
    setPrevMsg(toast.message);
    setExiting(false);
  }

  const v    = VARIANTS[toast.variant] || VARIANTS.success;
  const Icon = v.icon;

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 2700);
    return () => clearTimeout(t);
  }, [toast.id, toast.message, toast.variant]);

  useEffect(() => {
    if (exiting) {
      const t = setTimeout(() => onDismiss(toast.id), 280);
      return () => clearTimeout(t);
    }
  }, [exiting, onDismiss, toast.id]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-280 ${
        exiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{
        background: 'rgba(10,10,14,0.95)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: `1px solid ${v.border}`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
      }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: v.bg, border: `1px solid ${v.border}` }}
      >
        <Icon size={13} style={{ color: v.color }} />
      </div>
      <p className="text-[12.5px] font-medium text-white/90 flex-1 min-w-0 leading-snug">{toast.message}</p>
      <button
        onClick={() => setExiting(true)}
        className="w-5 h-5 rounded-lg flex items-center justify-center text-white/25 hover:text-white transition-colors shrink-0"
      >
        <FiX size={12} />
      </button>
    </div>
  );
};

export default function Toast() {
  const toasts      = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-24 md:bottom-[100px] left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 w-[min(90vw,360px)] pointer-events-auto">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={removeToast} />)}
    </div>
  );
}
