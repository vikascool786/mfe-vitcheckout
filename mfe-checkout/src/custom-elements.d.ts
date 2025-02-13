import React from "react";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'src-card-list': {
                'card-brands'?: string;
            } & React.HTMLAttributes<HTMLElement>;
            'src-otp-input': {
                'type'?: string;
            } & React.HTMLAttributes<HTMLElement>;
            'src-otp-channel-selection': {
                'type'?: string;
            } & React.HTMLAttributes<HTMLElement>;
            'src-learn-more': {
                'display-ok-button'?: string;
            } & React.HTMLAttributes<HTMLElement>;
        }
    }
}
