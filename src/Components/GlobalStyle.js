import {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
    @font-face {
        font-family: naru;
        src: url('naruto.ttf');
        font-display: swap;
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        list-style: none;
        text-decoration: none;
    }
    
    html {
        scroll-behavior: smooth;
    }
    
    body {
        font-family: 'naru', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-attachment: fixed;
        font-size: 1rem;
        line-height: 1.6;
        color: #ffffff;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
        
        @media screen and (max-width: 768px) {
            font-size: 0.95rem;
        }
        
        /* Custom Scrollbar - Modern Glass Effect */
        &::-webkit-scrollbar {
            width: 12px;
            
            @media screen and (max-width: 768px) {
                width: 8px;
            }
        }
        
        &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            margin: 4px 0;
        }
        
        &::-webkit-scrollbar-thumb {
            background: linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0.2) 100%
            );
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(8px);
            transition: all 0.3s ease;
            
            &:hover {
                background: linear-gradient(
                    180deg,
                    rgba(255, 255, 255, 0.4) 0%,
                    rgba(255, 255, 255, 0.3) 100%
                );
                border-color: rgba(255, 255, 255, 0.2);
            }
            
            &:active {
                background: linear-gradient(
                    180deg,
                    rgba(255, 255, 255, 0.5) 0%,
                    rgba(255, 255, 255, 0.4) 100%
                );
            }
        }
        
        /* Firefox Scrollbar */
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.05);
    }
    
    /* Selection Color */
    ::selection {
        background: rgba(255, 255, 255, 0.3);
        color: #ffffff;
    }
    
    ::-moz-selection {
        background: rgba(255, 255, 255, 0.3);
        color: #ffffff;
    }
    
    /* Focus Styles */
    *:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: 2px;
        border-radius: 4px;
    }
    
    /* Link Styles */
    a {
        color: inherit;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Button Reset */
    button {
        font-family: inherit;
        cursor: pointer;
        border: none;
        background: none;
    }
    
    /* Image Optimization */
    img {
        max-width: 100%;
        height: auto;
        display: block;
    }
    
    /* Smooth Transitions for Theme Changes */
    * {
        transition-property: background-color, border-color, color, fill, stroke;
        transition-duration: 0.2s;
        transition-timing-function: ease-in-out;
    }
    
    /* Remove transition for transform and opacity for performance */
    *:not(a):not(button):not(img) {
        transition-property: background-color, border-color, color;
    }
`;

export default GlobalStyle;