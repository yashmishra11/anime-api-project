import { createGlobalStyle } from 'styled-components';
import { tokens } from '../theme/tokens';

const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        list-style: none;
        text-decoration: none;
    }
    
    html {
        scroll-behavior: smooth;
        background-color: ${tokens.colors.chassis};
        -webkit-overflow-scrolling: touch;
    }
    
    body {
        font-family: ${tokens.fonts.primary};
        background-color: ${tokens.colors.chassis};
        position: relative;
        font-size: 1rem;
        line-height: 1.6;
        color: ${tokens.colors.textPrimary};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
        min-height: 100vh;
        
        /* Hardware-accelerated fixed background on dedicated compositor layer */
        &::before {
            content: '';
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: -1;
            background-color: ${tokens.colors.chassis};
            background-image: 
                radial-gradient(circle at 10% 12%, rgba(255, 94, 40, 0.08) 0%, transparent 45%),
                radial-gradient(circle at 90% 88%, rgba(255, 94, 40, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, transparent 70%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.025'/%3E%3C/svg%3E");
            transform: translateZ(0);
            will-change: transform;
        }
        
        @media screen and (max-width: 768px) {
            font-size: 0.95rem;
        }
        
        /* Industrial Recessed Scrollbar */
        &::-webkit-scrollbar {
            width: 14px;
            
            @media screen and (max-width: 768px) {
                width: 8px;
            }
        }
        
        &::-webkit-scrollbar-track {
            background: ${tokens.colors.chassis};
            box-shadow: inset 2px 2px 4px ${tokens.colors.borderShadow}, inset -2px -2px 4px ${tokens.colors.borderLight};
        }
        
        &::-webkit-scrollbar-thumb {
            background: ${tokens.colors.chassis};
            border-radius: ${tokens.radii.full};
            border: 2px solid ${tokens.colors.chassis};
            box-shadow: 3px 3px 6px ${tokens.colors.borderShadow}, -3px -3px 6px ${tokens.colors.borderLight};
            transition: ${tokens.transitions.fast};
            
            &:hover {
                box-shadow: 4px 4px 8px ${tokens.colors.borderShadow}, -4px -4px 8px ${tokens.colors.borderLight};
                background: #d3d8df;
            }
            
            &:active {
                box-shadow: inset 2px 2px 4px ${tokens.colors.borderShadow}, inset -2px -2px 4px ${tokens.colors.borderLight};
            }
        }
        
        /* Firefox Scrollbar */
        scrollbar-width: thin;
        scrollbar-color: ${tokens.colors.borderDark} ${tokens.colors.chassis};
    }
    
    /* Selection Color with Safety Orange Accent */
    ::selection {
        background: ${tokens.colors.accent};
        color: ${tokens.colors.accentForeground};
    }
    
    ::-moz-selection {
        background: ${tokens.colors.accent};
        color: ${tokens.colors.accentForeground};
    }
    
    /* Industrial Tactile Focus Rings */
    *:focus-visible {
        outline: 2px solid ${tokens.colors.accent};
        outline-offset: 2px;
        box-shadow: ${tokens.shadows.glowOrange};
        border-radius: ${tokens.radii.sm};
    }
    
    /* Link Styles */
    a {
        color: inherit;
        transition: ${tokens.transitions.normal};
    }
    
    /* Button Reset */
    button {
        font-family: inherit;
        cursor: pointer;
        border: none;
        background: none;
    }
    
    /* Image Optimization with Hardware Acceleration */
    img {
        max-width: 100%;
        height: auto;
        display: block;
        transform: translateZ(0);
    }
`;

export default GlobalStyle;