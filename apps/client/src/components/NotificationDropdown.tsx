"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every 10 seconds
      interval = setInterval(() => {
        fetchNotifications();
      }, 10000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/notification/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/notification/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        fetchNotifications(); // Refresh list to clear unread status
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform hover:scale-110" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-zinc-950">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex items-center justify-between px-2 py-2">
          <DropdownMenuLabel className="font-semibold px-0 py-0">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`flex flex-col gap-1 p-3 text-sm border-b last:border-0 ${notif.read ? "opacity-70" : "bg-blue-50/50 dark:bg-blue-900/10"}`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{notif.title}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
