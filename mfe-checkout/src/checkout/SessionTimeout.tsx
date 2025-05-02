import React, { useEffect, useRef, useState } from "react";
import { throttle } from "lodash";
import { Button } from "../component/Button/Button";
import "./SessionTimeout.scss"
import { doFAMOSSessionPing } from "../api/ajaxaction/FamosSession";

const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes - MFE timeout to show timeout overlay
const FAMOS_PING_INTERVAL = 5 * 60 * 1000; // 5 minutes - how often to ping FAMOS to keep session alive

const SessionTimeout = () => {
    const [showOverlay, setShowOverlay] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const famosPingIntervalId = useRef<NodeJS.Timeout | null>(null);

    const sendFAMOSSessionPing = async () => {
        const now = Date.now();
        const isUserActive = now - lastActivityRef.current < FAMOS_PING_INTERVAL;
        if (isUserActive) { //since we are checking every 5 mins, ping FAMOS only if user has been active in last 5 mins
            try {
                await doFAMOSSessionPing();
            } catch (e) {
                console.error("FAMOS session ping failed", e);
            }
        }
    };

    const startFamosPingInterval = () => {
        if (famosPingIntervalId.current) clearInterval(famosPingIntervalId.current);
        famosPingIntervalId.current = setInterval(sendFAMOSSessionPing, FAMOS_PING_INTERVAL);
    };

    const stopFamosPingInterval = () => {
        if (famosPingIntervalId.current) clearInterval(famosPingIntervalId.current);
        famosPingIntervalId.current = null;
    };

    const handleFETimeout = () => {
        resetTimeout();
        handleUserActivity();
    }

    const handleUserActivity = throttle(() => {
        lastActivityRef.current = Date.now();
    }, 10000); // Throttle function calls to once per 10 seconds

    const resetTimeout = throttle(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setShowOverlay(true);
            stopFamosPingInterval();
        }, SESSION_TIMEOUT);

    }, 10000); // Throttle function calls to once per 10 seconds

    const handleLogout = () => {
        window.location.href = "/nbts/ccn_cart.xhtml";
    };

    useEffect(() => {
        resetTimeout();
        startFamosPingInterval();

        window.addEventListener("mousemove", handleFETimeout);
        window.addEventListener("keydown", handleFETimeout);

        // Mobile events
        window.addEventListener("touchstart", handleFETimeout);
        window.addEventListener("scroll", handleFETimeout);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            stopFamosPingInterval();
            window.removeEventListener("mousemove", handleFETimeout);
            window.removeEventListener("keydown", handleFETimeout);
            window.removeEventListener("touchstart", handleFETimeout);
            window.removeEventListener("scroll", handleFETimeout);
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
                <div className="session-timeout-container checkout-overlay-simple max-500">
                    <h2>Session Timeout</h2>
                    <p>Your session has expired, you will be returned to the shopping cart</p>
                    <Button label="Okay" btnType="primary" onClick={handleLogout} />
                </div>
            </div>
        ) : null
    );
};

export default SessionTimeout;
