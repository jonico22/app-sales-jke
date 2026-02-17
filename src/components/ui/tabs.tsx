import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

// Context to share state between components
interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Main Tabs Component
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue: string;
    children: React.ReactNode;
}

export function Tabs({ defaultValue, children, className, ...props }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("w-full", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

// Container for Triggers
export function TabsList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-md bg-transparent p-1 text-slate-500",
                "border-b border-slate-200 w-full justify-start rounded-none px-0",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Individual Trigger (Tab Button)
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.activeTab === value;

    return (
        <button
            type="button"
            data-state={isActive ? "active" : "inactive"}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap px-6 py-2.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                "border-b-2 border-transparent hover:text-slate-700",
                isActive
                    ? "border-[#0ea5e9] text-[#0ea5e9] font-bold"
                    : "text-slate-500 hover:border-slate-300",
                className
            )}
            onClick={() => context.setActiveTab(value)}
            {...props}
        >
            {children}
        </button>
    );
}

// Content Area
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.activeTab !== value) return null;

    return (
        <div
            className={cn(
                " ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9] focus-visible:ring-offset-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
