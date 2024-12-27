import { useEffect, useRef } from 'react';

function useImageLazyLoad() {
    const imageRef = useRef<HTMLImageElement | null>(null);
    useEffect(() => {
        const image = imageRef.current;
        if (!image) {
            return;
        }
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    (entry.target as HTMLImageElement).src = image.dataset.src ?? '';
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(image);
        return () => {
            observer.unobserve(image);
        };
    }, []);
    return imageRef;
}
export default useImageLazyLoad;
