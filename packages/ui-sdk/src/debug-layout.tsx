import React from 'react';
import { cn } from '@/lib/utils';

interface DebugContainerProps {
    children: React.ReactNode;
    title: string;
    description?: string;
}

export function DebugContainer({ children, title, description }: DebugContainerProps) {
    return (
        <div className="bg-background text-foreground mx-auto min-h-screen max-w-4xl space-y-12 p-8">
            <header className="space-y-2 border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground text-lg">{description}</p>}
            </header>
            {children}
        </div>
    );
}

interface DebugSectionProps {
    title: string;
    children: React.ReactNode;
}

export function DebugSection({ title, children }: DebugSectionProps) {
    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="bg-border h-px flex-1" />
            </div>
            {children}
        </section>
    );
}

interface DebugGridProps {
    children: React.ReactNode;
}

export function DebugGrid({ children }: DebugGridProps) {
    return <div className="grid grid-cols-1 gap-8 md:grid-cols-2">{children}</div>;
}

interface DebugGroupProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function DebugGroup({ title, children, className }: DebugGroupProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">{title}</h3>
            {children}
        </div>
    );
}

interface DebugGroupConfig {
    title: string;
    children: React.ReactNode[];
}

interface DebugSectionConfig {
    title: string;
    groups: DebugGroupConfig[];
}

interface UseDebugPageProps {
    title: string;
    description?: string;
    config: DebugSectionConfig[];
}

export function useDebugPage({ title, description, config }: UseDebugPageProps) {
    const render = () => (
        <DebugContainer title={title} description={description}>
            {config.map((section, sIdx) => (
                <DebugSection key={sIdx} title={section.title}>
                    <DebugGrid>
                        {section.groups.map((group, gIdx) => (
                            <DebugGroup key={gIdx} title={group.title}>
                                {group.children}
                            </DebugGroup>
                        ))}
                    </DebugGrid>
                </DebugSection>
            ))}
        </DebugContainer>
    );

    return { render };
}
