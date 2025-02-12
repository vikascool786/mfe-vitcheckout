import React from "react";

interface INotifications {
    notificationMessages: string[];
}

export const Notifications: React.FC<INotifications> = ({ notificationMessages }) => {
    return notificationMessages.length > 0 ? (
        <div>
            {notificationMessages.map((message, index) => (
                <div className="error-message">{message}</div>
            ))}
        </div>
    ) : null;
};
