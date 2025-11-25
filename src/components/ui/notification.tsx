import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { type, message } = event.detail;
      const id = Math.random().toString(36).substr(2, 9);
      
      setNotifications((prev) => [...prev, { id, type, message }]);
      
      // Auto-remover después de 5 segundos
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    };

    window.addEventListener('show-notification', handleNotification as EventListener);
    
    return () => {
      window.removeEventListener('show-notification', handleNotification as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const bgColor = {
    success: 'bg-green-50 border-green-500',
    error: 'bg-red-50 border-red-500',
    warning: 'bg-yellow-50 border-yellow-500',
    info: 'bg-blue-50 border-blue-500',
  }[notification.type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[notification.type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[notification.type];

  return (
    <div
      className={`${bgColor} ${textColor} border-l-4 p-4 rounded shadow-lg max-w-md animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-start">
        <span className="text-xl mr-3">{icon}</span>
        <div className="flex-1">
          <p className="font-medium">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
