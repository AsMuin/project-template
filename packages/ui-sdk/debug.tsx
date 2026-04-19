import { scan } from 'react-scan';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Mail, Search, User, Lock, AlertCircle, Eye } from 'lucide-react';
import Input from '@ui-sdk/components/Input';
import Button from '@ui-sdk/components/Button';
import { useDebugPage } from '@ui-sdk/debug-layout';
import Checkbox from '@ui-sdk/components/Checkbox';
import './index.css';
import Toaster from '@ui-sdk/components/Toaster';
import Tooltip from '@ui-sdk/components/Tooltips';
import Select from '@ui-sdk/components/Select';

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
                            <Input key="1" label="Disabled" disabled placeholder="Can't type here" value="Disabled value" />,
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
                                    <button
                                        className="hover:text-primary flex items-center justify-center transition-colors focus:outline-none"
                                        aria-label="Toggle password visibility">
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
            },
            {
                title: 'Sonner',
                groups: [
                    {
                        title: 'Basic',
                        children: [
                            <div key="basic" className="flex flex-wrap gap-4">
                                <Button onClick={() => Toaster.toast('Hello world!')}>Toast</Button>
                                <Button className="bg-green-500" onClick={() => Toaster.toast.success('Hello world!')}>
                                    Success
                                </Button>
                                <Button className="bg-red-500" onClick={() => Toaster.toast.error('Hello world!')}>
                                    Error
                                </Button>
                                <Button className="bg-blue-500" onClick={() => Toaster.toast.info('Hello world!')}>
                                    Info
                                </Button>
                                <Button className="bg-yellow-500" onClick={() => Toaster.toast.warning('Hello world!')}>
                                    Warning
                                </Button>
                            </div>
                        ]
                    }
                ]
            },
            {
                title: 'Tooltip',
                groups: [
                    {
                        title: 'bottom',
                        children: [
                            <div key="bottom" className="flex flex-wrap gap-4">
                                <Tooltip toolTipContent="Hello world!" side="bottom">
                                    <Button>Tooltip</Button>
                                </Tooltip>
                            </div>
                        ]
                    },
                    {
                        title: 'top',
                        children: [
                            <div key="basic" className="flex flex-wrap gap-4">
                                <Tooltip toolTipContent="Hello world!" side="top">
                                    <Button>Tooltip</Button>
                                </Tooltip>
                            </div>
                        ]
                    },
                    {
                        title: 'right',
                        children: [
                            <div key="right" className="flex flex-wrap gap-4">
                                <Tooltip toolTipContent="Hello world!" side="right">
                                    <Button>Tooltip</Button>
                                </Tooltip>
                            </div>
                        ]
                    },

                    {
                        title: 'left',
                        children: [
                            <div key="left" className="flex flex-wrap gap-4">
                                <Tooltip toolTipContent="Hello world!" side="left">
                                    <Button>Tooltip</Button>
                                </Tooltip>
                            </div>
                        ]
                    }
                ]
            },
            {
                title: 'Select',
                groups: [
                    {
                        title: 'Basic',
                        children: [
                            <Select
                                key="basic"
                                placeholder="select option"
                                options={[
                                    { value: '1', label: 'Option 1' },
                                    { value: '2', label: 'Option 2' }
                                ]}
                            />
                        ]
                    },
                    {
                        title: 'With Value',
                        children: [
                            <Select
                                key="with-value"
                                placeholder="select option"
                                value="1"
                                options={[
                                    { value: '1', label: 'Option 1' },
                                    { value: '2', label: 'Option 2' }
                                ]}
                            />
                        ]
                    },
                    {
                        title: 'Disabled',
                        children: [
                            <Select
                                key="disabled"
                                placeholder="select option"
                                disabled
                                options={[
                                    { value: '1', label: 'Option 1' },
                                    { value: '2', label: 'Option 2' }
                                ]}
                            />
                        ]
                    },
                    {
                        title: 'With Label',
                        children: [
                            <Select
                                key="with-label"
                                label="Select Option"
                                placeholder="select option"
                                options={[
                                    { value: '1', label: 'Option 1' },
                                    { value: '2', label: 'Option 2' }
                                ]}
                            />
                        ]
                    },
                    {
                        title: 'With Error',
                        children: [
                            <Select
                                key="with-error"
                                label="Select Option"
                                placeholder="select option"
                                error="This field is required"
                                options={[
                                    { value: '1', label: 'Option 1' },
                                    { value: '2', label: 'Option 2' }
                                ]}
                            />
                        ]
                    },
                    {
                        title: 'With Description',
                        children: [
                            <Select
                                key="with-description"
                                label="Select Option"
                                placeholder="select option"
                                description="This is a description"
                                options={[
                                    { value: '1', label: 'Option 1' },
                                    { value: '2', label: 'Option 2' }
                                ]}
                            />
                        ]
                    },
                    {
                        title: 'With Object Options',
                        children: [
                            <Select
                                key="with-object-options"
                                label="Select Option"
                                placeholder="select option"
                                options={[
                                    { value: { id: 1, name: 'Option 1' }, label: 'Option 1' },
                                    { value: { id: 2, name: 'Option 2' }, label: 'Option 2' }
                                ]}
                                defaultValue={{ id: 1, name: 'Option 1' }}
                                onSelect={value => console.log(value)}
                            />
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
            <Tooltip.TooltipProvider>
                <DebugPage />
                <Toaster />
            </Tooltip.TooltipProvider>
        </StrictMode>
    );
}
