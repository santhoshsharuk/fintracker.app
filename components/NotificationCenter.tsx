import React, { useState, useMemo } from 'react';
import { Notification, NotificationType } from '../types';
import { BellIcon, TargetIcon, BudgetIcon, BillsIcon } from './Icons';

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkAsRead: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkAsRead }) => {
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.isRead).length;
    }, [notifications]);

    const handleToggle = () => {
        if (!isOpen && unreadCount > 0) {
            onMarkAsRead();
        }
        setIsOpen(prev => !prev);
    };

    const getIconForType = (type: NotificationType) => {
        switch (type) {
            case NotificationType.BILL_DUE:
                return <BillsIcon className="w-5 h-5 text-accent-yellow" />;
            case NotificationType.BUDGET_EXCEEDED:
                return <BudgetIcon className="w-5 h-5 text-accent-red" />;
            case NotificationType.GOAL_MILESTONE:
                return <TargetIcon className="w-5 h-5 text-secondary" />;
            default:
                return <BellIcon className="w-5 h-5 text-gray-400" />;
        }
    }
    
    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "min ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="relative">
            <button onClick={handleToggle} className="p-2 bg-gray-800 rounded-full relative hover:bg-gray-700">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-accent-red text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-700">
                        <h3 className="font-semibold text-lg">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className="flex items-start p-3 hover:bg-gray-700/50 border-b border-gray-700/50">
                                    <div className="flex-shrink-0 mt-1 mr-3">
                                        {getIconForType(n.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-200">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(n.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 p-4 text-center">No notifications yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;