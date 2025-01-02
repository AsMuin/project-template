import useOnMounted from '@/hooks/lifecycle/useOnMounted';
import { MessageType, IMessageProps } from '../MessageManager';
import { useState } from 'react';
function Message({
    id,
    type = 'info',
    message = '',
    duration = 3000,
    removeMessage
}: { removeMessage?: (id: string) => void } & Omit<IMessageProps, 'position'>) {
    const [isHideMessage, setIsHideMessage] = useState(false);
    function getMessage(type: MessageType) {
        switch (type) {
            case 'info': {
                return (
                    <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                        <span>{message}</span>
                    </div>
                );
            }

            case 'success': {
                return (
                    <div className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{message}</span>
                    </div>
                );
            }

            case 'warning': {
                return (
                    <div className="alert alert-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <span>{message}</span>
                    </div>
                );
            }

            case 'error': {
                return (
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{message}</span>
                    </div>
                );
            }

            default: {
                return null;
            }
        }
    }
    function hideMessage() {
        setIsHideMessage(true);
        setTimeout(() => {
            removeMessage?.(id);
        }, 500);
    }
    useOnMounted(() => {
        if (removeMessage && duration) {
            setTimeout(() => {
                hideMessage();
            }, duration);
        }
    });
    return (
        <div className={`transition-all duration-500 ${isHideMessage ? 'translate-x-4 translate-y-[-1rem] scale-0 opacity-0' : ''}`}>
            {getMessage(type)}
        </div>
    );
}

export default Message;
