import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useSmoothScroll = () => {
    const location = useLocation();
    const stateRef = useRef({
        isRunning: false,
        targetY: 0,
        currentY: 0,
        rafId: null
    });

    // Reset scroll smoothly to top on route change
    useEffect(() => {
        const state = stateRef.current;
        state.targetY = 0;
        state.currentY = 0;
        state.isRunning = false;
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [location.pathname]);

    useEffect(() => {
        const state = stateRef.current;
        state.targetY = window.scrollY;
        state.currentY = window.scrollY;
        const ease = 0.075; // Buttery smooth easing factor

        const isScrollable = (el) => {
            if (!el || el === document.body || el === document.documentElement) return false;
            const style = window.getComputedStyle(el);
            const overflowY = style.overflowY;
            const hasScroll = el.scrollHeight > el.clientHeight;
            return hasScroll && (overflowY === 'auto' || overflowY === 'scroll');
        };

        const render = () => {
            const diff = state.targetY - state.currentY;
            state.currentY += diff * ease;

            if (Math.abs(diff) < 0.4) {
                state.currentY = state.targetY;
                window.scrollTo(0, Math.round(state.currentY));
                state.isRunning = false;
                cancelAnimationFrame(state.rafId);
                state.rafId = null;
                return;
            }

            window.scrollTo(0, Math.round(state.currentY));
            state.rafId = requestAnimationFrame(render);
        };

        const onWheel = (e) => {
            // Ignore zoom gestures
            if (e.ctrlKey) return;

            // Allow native scrolling inside nested scrollable elements (e.g., textareas, modals)
            let target = e.target;
            while (target && target !== document.body && target !== document.documentElement) {
                if (isScrollable(target)) {
                    return;
                }
                target = target.parentElement;
            }

            // Normalize delta across input devices and browsers
            let delta = e.deltaY;
            if (e.deltaMode === 1) delta *= 35; // Line mode
            if (e.deltaMode === 2) delta *= 600; // Page mode

            // Slightly dampen huge mouse wheel spikes
            const clampedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 120);

            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            state.targetY = Math.max(0, Math.min(state.targetY + clampedDelta * 1.6, maxScroll));

            if (!state.isRunning) {
                state.isRunning = true;
                state.currentY = window.scrollY;
                state.rafId = requestAnimationFrame(render);
            }

            e.preventDefault();
        };

        const onScroll = () => {
            // Keep in sync when user drags scrollbar or presses PageUp/PageDown
            if (!state.isRunning) {
                state.targetY = window.scrollY;
                state.currentY = window.scrollY;
            }
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('scroll', onScroll);
            if (state.rafId) cancelAnimationFrame(state.rafId);
        };
    }, []);
};
