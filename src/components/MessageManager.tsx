import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Message from './UI/Message';

type Position = 'topStart' | 'topEnd' | 'topCenter' | 'bottomStart' | 'bottomEnd' | 'middleCenter';
export type MessageType = 'info' | 'success' | 'warning' | 'error';

export interface IMessageProps {
    position?: Position;
    id: string;
    type?: MessageType;
    message?: string;
    duration?: number;
}

let addMessage: (message: Omit<IMessageProps, 'id'>) => void;
function MessageManager() {
    const [messageList, setMessageList] = useState<Record<Position, IMessageProps[]>>({
        topStart: [],
        topEnd: [],
        topCenter: [],
        bottomStart: [],
        bottomEnd: [],
        middleCenter: []
    });
    addMessage = useCallback((message: Omit<IMessageProps, 'id'>) => {
        const { position = 'topCenter' } = message;
        setMessageList(prev => ({
            ...prev,
            [position]: [...prev[position], { id: (Math.random() + Date.now()).toString(36).slice(2, 9), ...message }]
        }));
    }, []);
    const removeMessage = useCallback((position: Position, id: string) => {
        setMessageList(prev => ({
            ...prev,
            [position]: prev[position].filter(message => message.id !== id)
        }));
    }, []);
    const messageConfig: {
        position: Position;
        messageList: IMessageProps[];
        className: string;
    }[] = [
        { position: 'topStart', messageList: messageList.topStart, className: 'toast toast-start toast-top' },
        { position: 'topEnd', messageList: messageList.topEnd, className: 'toast toast-end toast-top' },
        { position: 'topCenter', messageList: messageList.topCenter, className: 'toast toast-center toast-top' },
        { position: 'bottomStart', messageList: messageList.bottomStart, className: 'toast toast-start toast-bottom' },
        { position: 'bottomEnd', messageList: messageList.bottomEnd, className: 'toast toast-end toast-bottom' },
        { position: 'middleCenter', messageList: messageList.middleCenter, className: 'toast toast-center toast-middle' }
    ];
    return createPortal(
        <>
            {messageConfig.map(({ position, messageList, className }) => (
                <div key={position} className={className}>
                    {messageList.map(message => (
                        <Message key={message.id} {...message} removeMessage={(id: string) => removeMessage(position, id)} />
                    ))}
                </div>
            ))}
        </>,
        document.body
    );
}

export default MessageManager;

export const showMessage = (message: Omit<IMessageProps, 'id'>) => {
    if (addMessage) {
        addMessage(message);
    } else {
        throw new Error('addMessage is not defined');
    }
};
