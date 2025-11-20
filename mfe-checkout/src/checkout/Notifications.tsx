import React from "react";

interface INotifications {
    notificationMessages: string[];
}

const parseMessage = (message: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];

    const regex = /(<a .*?href="(.*?)".*?>(.*?)<\/a>)|(<b>(.*?)<\/b>)/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(message)) !== null) {
        if (match.index > lastIndex) {
            parts.push(message.substring(lastIndex, match.index));
        }

        if (match[1]) {
            // <a> match
            parts.push(
                <a key={parts.length} href={match[2]} target="_blank" rel="noopener noreferrer">
                    {match[3]}
                </a>
            );
        } else if (match[4]) {
            // <b> match
            parts.push(<b key={parts.length}>{match[5]}</b>);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < message.length) {
        parts.push(message.substring(lastIndex));
    }

    return parts;
};

export const Notifications: React.FC<INotifications> = ({ notificationMessages }) => {
    if (notificationMessages.length === 0) return null;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    
    return (
        <div>
            {notificationMessages.map((message, index) => (
                <div key={index} className="error-message">
                    {parseMessage(message)}
                </div>
            ))}
        </div>
    );
};
