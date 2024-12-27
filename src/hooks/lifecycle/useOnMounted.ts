import { useEffect } from 'react';

function useOnMounted(effect: () => void) {
    useEffect(() => {
        effect();
    }, []);
}
export default useOnMounted;
