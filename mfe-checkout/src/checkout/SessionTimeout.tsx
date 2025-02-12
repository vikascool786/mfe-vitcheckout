import React, { useEffect, useRef, useState } from "react";
import { throttle } from "lodash";
import { Button } from "../component/Button/Button";
import "./SessionTimeout.scss"

const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes

const SessionTimeout = () => {
    const [showOverlay, setShowOverlay] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const resetTimeout = throttle(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setShowOverlay(true);
        }, SESSION_TIMEOUT);
    }, 10000); // Throttle function calls to once per 10 seconds

    const handleLogout = () => {
        window.location.href = "/nbts/ccn_cart.xhtml";
    };

    useEffect(() => {
        resetTimeout();
        window.addEventListener("mousemove", resetTimeout);
        window.addEventListener("keydown", resetTimeout);

        // Mobile events
        window.addEventListener("touchstart", resetTimeout);
        window.addEventListener("scroll", resetTimeout);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            window.removeEventListener("mousemove", resetTimeout);
            window.removeEventListener("keydown", resetTimeout);
            window.removeEventListener("touchstart", resetTimeout);
            window.removeEventListener("scroll", resetTimeout);
        };
    }, []);

    useEffect(() => {
        if (showOverlay) {
            document.body.style.overflow = "hidden"; // Disable scrolling
        } else {
            document.body.style.overflow = "auto"; // Enable scrolling
        }

        return () => {
            document.body.style.overflow = "auto"; // Ensure scroll is restored on unmount
        };
    }, [showOverlay]);

    return (
        showOverlay ? (
            <div className="overlay-wrapper">
                <div className="session-timeout-container overlay-simple max-500">
                    <h2>Session Timeout</h2>
                    <p>Your session has expired, you will be returned to the shopping cart</p>
                    <Button label="Okay" btnType="primary" onClick={handleLogout} />
                </div>
            </div>
        ) : null
    );
};

export default SessionTimeout;
