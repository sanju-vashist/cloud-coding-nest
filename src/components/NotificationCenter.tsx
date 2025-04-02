
import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, InfoIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationCenterProps {
  userId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = localStorage.getItem(`webOS_notifications_${userId}`);
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    localStorage.setItem(`webOS_notifications_${userId}`, JSON.stringify(notifications));
  }, [notifications, userId]);
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      timestamp: Date.now(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  const renderIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Add window to global for other components to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).webOSNotifications = {
        add: addNotification
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).webOSNotifications;
      }
    };
  }, []);
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative h-6 w-6" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </Button>
      
      {isOpen && (
        <Card className="absolute right-0 top-7 w-80 p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-50 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-2 p-1">
            <h3 className="text-sm font-medium">Notifications</h3>
            <div className="flex gap-1">
              {notifications.length > 0 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs px-2"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs px-2 text-red-500 hover:text-red-600"
                    onClick={clearAllNotifications}
                  >
                    Clear all
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
                <Bell className="h-12 w-12 mb-2 opacity-20" />
                <p className="text-center">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-2 rounded-md border ${notification.read ? 'bg-transparent' : 'bg-blue-50/50 dark:bg-blue-900/20'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="mt-0.5 mr-2">
                          {renderIcon(notification.type)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 -mt-1 -mr-1" 
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {!notification.read && (
                      <div className="mt-1 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs px-2" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default NotificationCenter;
