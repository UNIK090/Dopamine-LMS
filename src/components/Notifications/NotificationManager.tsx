import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { AppNotification } from "../../types";
import NotificationToast from "./NotificationToast";

const NotificationManager: React.FC = () => {
  const { notifications, markNotificationAsRead } = useAppStore();
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const [processedNotifications, setProcessedNotifications] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    // Check for new unread notifications
    const unreadNotifications = notifications.filter(
      (notification) =>
        !notification.read && !processedNotifications.has(notification.id),
    );

    if (unreadNotifications.length > 0) {
      const newNotification =
        unreadNotifications[unreadNotifications.length - 1];

      // Add to active toasts
      setActiveToasts((prev) => [...prev, newNotification]);

      // Mark as processed to avoid showing again
      setProcessedNotifications(
        (prev) => new Set([...prev, newNotification.id]),
      );
    }
  }, [notifications, processedNotifications]);

  const handleCloseToast = (notificationId: string) => {
    setActiveToasts((prev) =>
      prev.filter((toast) => toast.id !== notificationId),
    );
  };

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {activeToasts.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => handleCloseToast(notification.id)}
          onRead={() => handleMarkAsRead(notification.id)}
          autoClose={notification.type !== "reminder"}
          duration={notification.type === "completion" ? 7000 : 5000}
        />
      ))}
    </div>
  );
};

export default NotificationManager;
