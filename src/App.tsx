import { useState } from 'react';

import MockManager from './features/location/components/MockManager';
import { cn } from './utils/common';

type TTab = 'location';

function App() {
    const [activeTab, setActiveTab] = useState<TTab>('location');

    return (
        <div className="bg-background text-foreground w-80 p-4 font-sans">
            <h2 className="border-border m-0 mb-4 border-b pb-2.5 text-base">🛠️ Anywhere Debugger</h2>

            <div className="mb-4 flex gap-2">
                <Button isActive={activeTab === 'location'} onClick={() => setActiveTab('location')} label="定位" />
            </div>

            <div className="space-y-3">{activeTab === 'location' && <MockManager />}</div>
        </div>
    );
}

interface ButtonProps {
    isActive: boolean;
    onClick: () => void;
    label: string;
}

function Button({ isActive, onClick, label }: ButtonProps) {
    return (
        <button
            className={cn(
                'flex-1 cursor-pointer rounded-md border-0 px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            onClick={onClick}>
            {label}
        </button>
    );
}

export default App;
