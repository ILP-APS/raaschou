
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface FokusarkDataContextType {
  refreshData: () => void;
  isRefreshing: boolean;
}

// Create the context with default values
export const FokusarkDataContext = createContext<FokusarkDataContextType>({
  refreshData: () => {},
  isRefreshing: false,
});

interface FokusarkDataProviderProps {
  children: ReactNode;
}

export const FokusarkDataProvider: React.FC<FokusarkDataProviderProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshData = () => {
    setIsRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    // Allow component tree to update
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <FokusarkDataContext.Provider value={{ refreshData, isRefreshing }}>
      {children}
    </FokusarkDataContext.Provider>
  );
};

export const useFokusarkDataContext = () => React.useContext(FokusarkDataContext);
