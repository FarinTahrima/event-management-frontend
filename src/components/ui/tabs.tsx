import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return <div className={`flex ${className}`}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within a Tabs component');

  const { activeTab, setActiveTab } = context;

  return (
    <button
      className={`px-4 py-2 ${
        activeTab === value
          ? 'text-blue-500 border-b-2 border-blue-500'
          : 'text-gray-300 hover:text-white'
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;  
  }
  
  export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within a Tabs component');
  
    const { activeTab } = context;
  
    if (activeTab !== value) return null;
  
    return <div className={className}>{children}</div>;  
  };