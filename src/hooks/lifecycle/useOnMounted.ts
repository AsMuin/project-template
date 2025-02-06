import { useEffect } from 'react';

function useOnMounted(effect: () => void) {
    useEffect(() => {
        effect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

export default useOnMounted;
