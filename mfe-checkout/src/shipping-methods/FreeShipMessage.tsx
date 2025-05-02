import React from "react";

interface IShippingMessageProps {
    freeShipMessage: string
}

export const FreeShipMessage: React.FC<IShippingMessageProps> = ({
    freeShipMessage
}) => {

    return (
        <div className="free-ship-container">
            {freeShipMessage.length > 0 && (
                <div className="alert-message">{freeShipMessage}</div>
            )}
        </div>
    );
};
