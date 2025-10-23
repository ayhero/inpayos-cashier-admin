// import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '@/utils/toast';
import { cn } from './utils';

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-800',
    iconClassName: 'text-green-500'
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
    iconClassName: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    iconClassName: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
    iconClassName: 'text-blue-500'
  }
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToastStore();
  const variant = toastVariants[toast.type];
  const Icon = variant.icon;

  return (
    <div className={cn(
      'relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-md transition-all',
      'animate-in slide-in-from-right-full duration-300',
      variant.className
    )}>
      <Icon className={cn('h-5 w-5 flex-shrink-0', variant.iconClassName)} />
      <div className="flex-1 space-y-1">
        <div className="font-medium">{toast.title}</div>
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="absolute right-2 top-2 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
