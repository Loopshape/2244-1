
import { gsap } from 'gsap';

export const animatePacket = (sourceEl: HTMLElement, targetEl: HTMLElement): Promise<void> => {
    return new Promise(resolve => {
        if (!sourceEl || !targetEl) {
            resolve();
            return;
        }

        const packet = document.createElement('div');
        packet.className = 'fixed w-3 h-3 rounded-full bg-[#BB86FC] z-[100] pointer-events-none';
        packet.style.boxShadow = '0 0 10px #BB86FC, 0 0 20px #BB86FC';
        document.body.appendChild(packet);

        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        const startX = sourceRect.left + sourceRect.width / 2;
        const startY = sourceRect.top + sourceRect.height / 2;
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;

        gsap.set(packet, { x: startX, y: startY, opacity: 1, scale: 0.5 });

        gsap.to(packet, {
            x: endX,
            y: endY,
            scale: 1,
            opacity: 0.8,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(packet, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => {
                        packet.remove();
                        resolve();
                    }
                });
            }
        });
    });
};
