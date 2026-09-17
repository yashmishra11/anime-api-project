import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSmoothScroll = () => {
    const location = useLocation();

    // Reset scroll on route change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname]);

    useEffect(() => {
        let isRunning = false;
        let targetY = window.scrollY;
        let currentY = window.scrollY;
        const ease = 0.075; // Buttery smooth easing factor
        let rafId = null;

        const isScrollable = (el) => {
            if (!el || el === document.body || el === document.documentElement) return false;
            const style = window.getComputedStyle(el);
            const overflowY = style.overflowY;
            const hasScroll = el.scrollHeight > el.clientHeight;
            return hasScroll && (overflowY === 'auto' || overflowY === 'scroll');
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
            targetY = Math.max(0, Math.min(targetY + clampedDelta * 1.6, maxScroll));

            if (!isRunning) {
                isRunning = true;
                currentY = window.scrollY;
                rafId = requestAnimationFrame(render);
            }

            e.preventDefault();
        };

        const render = () => {
            const diff = targetY - currentY;
            currentY += diff * ease;

            if (Math.abs(diff) < 0.4) {
                currentY = targetY;
                window.scrollTo(0, Math.round(currentY));
                isRunning = false;
                cancelAnimationFrame(rafId);
                return;
            }

            window.scrollTo(0, Math.round(currentY));
            rafId = requestAnimationFrame(render);
        };

        const onScroll = () => {
            // Keep in sync when user drags scrollbar or presses PageUp/PageDown
            if (!isRunning) {
                targetY = window.scrollY;
                currentY = window.scrollY;
            }
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('scroll', onScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);
};
