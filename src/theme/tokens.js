import { css } from 'styled-components';

export const tokens = {
    colors: {
        chassis: '#e0e5ec',         // Level 0 base background
        panel: '#f0f2f5',           // Level +1 raised surface
        panelDark: '#2d3436',       // Dark technical panel surface
        recessed: '#d1d9e6',        // Level -1 recessed wells, inputs, grooves
        textPrimary: '#2d3436',     // Dark charcoal ink
        textMuted: '#4a5568',       // WCAG AA compliant slate grey
        textLight: '#ffffff',       // White text for dark surfaces or accents
        accent: '#ff4757',          // Safety Orange / Braun Red
        accentHover: '#e03848',     // Deepened accent for hover
        accentForeground: '#ffffff',// High contrast text on accent
        borderShadow: '#babecc',    // Darker shadow color in neumorphic pairs
        borderLight: '#ffffff',     // Lighter highlight color
        borderDark: '#a3b1c6',      // Machine divider / prominent border
        ledGreen: '#22c55e',        // Active / online LED status
        ledOrange: '#ff4757',       // Alert / primary LED status
        ledAmber: '#f59e0b',        // Standby LED status
    },
    shadows: {
        // Base elevation for cards and panels (45deg top-left lighting)
        card: '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        // High elevation for interactive elements
        floating: '12px 12px 24px #babecc, -12px -12px 24px #ffffff, inset 1px 1px 0 rgba(255, 255, 255, 0.6)',
        // Button hover elevation
        buttonHover: '10px 10px 20px #babecc, -10px -10px 20px #ffffff',
        // Pressed / depressed active state
        pressed: 'inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff',
        // Recessed wells (inputs, screens, slots)
        recessed: 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
        // Deep recessed
        recessedDeep: 'inset 6px 6px 14px #babecc, inset -6px -6px 14px #ffffff',
        // Sharp mechanical edge
        sharp: '4px 4px 8px rgba(0, 0, 0, 0.15), -1px -1px 1px rgba(255, 255, 255, 0.8)',
        // Safety Orange button shadows
        accentButton: '4px 4px 10px rgba(255, 71, 87, 0.45), -4px -4px 10px rgba(255, 255, 255, 0.9)',
        accentButtonPressed: 'inset 4px 4px 8px rgba(166, 30, 45, 0.6), inset -4px -4px 8px rgba(255, 120, 130, 0.6)',
        // LED bloom glows
        glowGreen: '0 0 10px 2px rgba(34, 197, 94, 0.75)',
        glowOrange: '0 0 10px 2px rgba(255, 71, 87, 0.75)',
        glowAmber: '0 0 10px 2px rgba(245, 158, 11, 0.75)',
        // Embossed / debossed text shadows
        textEmbossed: '0 1px 0 #ffffff',
        textDebossed: '0 -1px 0 rgba(0, 0, 0, 0.4)',
    },
    radii: {
        xs: '3px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
    },
    fonts: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        technical: "'JetBrains Mono', 'Roboto Mono', monospace",
    },
    transitions: {
        fast: 'all 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
    }
};

// Reusable Industrial UI helpers
export const cornerScrews = css`
    background-image: 
        radial-gradient(circle at 12px 12px, #a3b1c6 1.5px, #ffffff 2.5px, transparent 3px),
        radial-gradient(circle at calc(100% - 12px) 12px, #a3b1c6 1.5px, #ffffff 2.5px, transparent 3px),
        radial-gradient(circle at 12px calc(100% - 12px), #a3b1c6 1.5px, #ffffff 2.5px, transparent 3px),
        radial-gradient(circle at calc(100% - 12px) calc(100% - 12px), #a3b1c6 1.5px, #ffffff 2.5px, transparent 3px);
`;

export const ventSlots = css`
    display: flex;
    gap: 4px;
    align-items: center;
    
    &::before,
    &::after,
    span {
        content: '';
        display: block;
        width: 3px;
        height: 18px;
        border-radius: 9999px;
        background: ${tokens.colors.recessed};
        box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.2), inset -1px -1px 2px rgba(255, 255, 255, 0.8);
    }
`;

export const crtScanlines = css`
    position: relative;
    &::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
        background-size: 100% 4px;
        z-index: 2;
        border-radius: inherit;
    }
`;
