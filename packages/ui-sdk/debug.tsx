import { scan } from 'react-scan';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Mail, Search, User, Lock, AlertCircle, Eye } from 'lucide-react';
import './index.css';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useDebugPage } from '@/debug-layout';
import Checkbox from '@/components/Checkbox';

scan({ enabled: true, log: false });

const rootElement = document.getElementById('root')!;

function DebugPage() {
    const { render } = useDebugPage({
        title: 'Component Registry & Debug',
        description: 'Testing and refining UI components.',
        config: [
            {
                title: 'Input',
                groups: [
                    {
                        title: 'Basic & Labels',
                        children: [
                            <Input key="1" placeholder="Basic input" />,
                            <Input key="2" label="Email Address" placeholder="name@example.com" />,
                            <Input key="3" label="Username" description="This is how others will see you." placeholder="shadcn" />
                        ]
                    },
                    {
                        title: 'States',
                        children: [
                            <Input key="1" label="Disabled" disabled placeholder="Can't type here" />,
                            <Input key="2" label="Error State" error="This field is required" defaultValue="Invalid value" />,
                            <Input key="3" label="Required Field" required placeholder="I'm required but looking normal" />
                        ]
                    },
                    {
                        title: 'Icons & Addons',
                        children: [
                            <Input key="1" startContent={<Search className="text-muted-foreground" />} placeholder="Search everything..." />,
                            <Input key="2" label="Authentication" startContent={<User className="text-muted-foreground" />} placeholder="Username" />,
                            <Input
                                key="3"
                                type="password"
                                label="Password"
                                startContent={<Lock className="text-muted-foreground" />}
                                endContent={
                                    <button className="hover:text-primary flex items-center justify-center transition-colors focus:outline-none">
                                        <Eye className="size-4" />
                                    </button>
                                }
                                placeholder="Enter password"
                            />,
                            <Input
                                key="4"
                                label="Email"
                                startContent={<Mail />}
                                endContent={<span className="text-muted-foreground text-xs font-medium">@gmail.com</span>}
                                placeholder="username"
                            />
                        ]
                    },
                    {
                        title: 'Combinations',
                        children: [
                            <Input
                                key="1"
                                label="Search with Meta"
                                startContent={<Search />}
                                description="Use Cmd+K to search"
                                placeholder="Start typing..."
                            />,
                            <Input
                                key="2"
                                label="Validation Error with Icon"
                                startContent={<Mail />}
                                error="Invalid email address"
                                defaultValue="invalid-email"
                            />
                        ]
                    }
                ]
            },
            {
                title: 'Button',
                groups: [
                    {
                        title: 'Variants',
                        children: [
                            <div key="variants" className="flex flex-wrap gap-4">
                                <Button>Default</Button>
                                <Button type="secondary">Secondary</Button>
                                <Button type="destructive">Destructive</Button>
                                <Button type="outline">Outline</Button>
                                <Button type="ghost">Ghost</Button>
                                <Button type="link">Link</Button>
                            </div>
                        ]
                    },
                    {
                        title: 'Sizes',
                        children: [
                            <div key="sizes" className="flex flex-wrap items-center gap-4">
                                <Button size="sm">Small</Button>
                                <Button size="default">Default</Button>
                                <Button size="lg">Large</Button>
                                <Button size="icon">
                                    <Search />
                                </Button>
                                <Button size="icon-sm">
                                    <Search />
                                </Button>
                            </div>
                        ]
                    },
                    {
                        title: 'With Icons',
                        children: [
                            <div key="icons" className="flex flex-wrap gap-4">
                                <Button>
                                    <Mail /> Login with Email
                                </Button>
                                <Button type="outline">
                                    <Search /> Search
                                </Button>
                                <Button type="destructive" size="sm">
                                    <AlertCircle /> Delete
                                </Button>
                            </div>
                        ]
                    }
                ]
            },
            {
                title: 'Checkbox',
                groups: [
                    {
                        title: 'Basic & Labels',
                        children: [
                            <div key="sizes" className="flex flex-wrap items-center gap-4">
                                <Checkbox />
                                <Checkbox label="Accept terms and conditions" />
                                <Checkbox
                                    label="Accept terms and conditions"
                                    description="By clicking this checkbox, you agree to the terms and conditions."
                                />
                            </div>
                        ]
                    },
                    {
                        title: 'States',
                        children: [
                            <div key="sizes" className="flex flex-wrap items-center gap-4">
                                <Checkbox disabled label="Accept terms and conditions" />
                                <Checkbox
                                    defaultChecked
                                    label="Accept terms and conditions"
                                    description="By clicking this checkbox, you agree to the terms and conditions."
                                />
                                <Checkbox checked />
                            </div>
                        ]
                    }
                ]
            }
        ]
    });

    return render();
}

if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);

    root.render(
        <StrictMode>
            <DebugPage />
        </StrictMode>
    );
}
