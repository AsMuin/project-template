import { useEffect, useRef } from 'react';

function useHorizontalScroll(sensitivity: number = 2, throttleInterval: number = 200) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const eventTempRef = useRef(Date.now());

    useEffect(() => {
        const element = elementRef.current;
        if (!element) {
            return;
        }
        function handleWheel(event: WheelEvent) {
            event.preventDefault();
            const currentTime = Date.now();
            if (currentTime - eventTempRef.current >= throttleInterval) {
                element?.scrollTo({
                    left: element.scrollLeft + event.deltaY * sensitivity,
                    behavior: 'smooth'
                });
                eventTempRef.current = currentTime;
            }
        }
        element.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            element?.removeEventListener('wheel', handleWheel);
        };
    }, [sensitivity, throttleInterval]);
    return elementRef;
}
export default useHorizontalScroll;
