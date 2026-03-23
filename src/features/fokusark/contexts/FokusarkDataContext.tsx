
import React, { createContext, useState, ReactNode } from 'react';

interface FokusarkDataContextType {
  refreshData: () => void;
  isRefreshing: boolean;
}

export const FokusarkDataContext = createContext<FokusarkDataContextType>({
  refreshData: () => {},
  isRefreshing: false,
});

interface FokusarkDataProviderProps {
  children: ReactNode;
}

export const FokusarkDataProvider: React.FC<FokusarkDataProviderProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <FokusarkDataContext.Provider value={{ refreshData, isRefreshing }}>
      {children}
    </FokusarkDataContext.Provider>
  );
};

export const useFokusarkDataContext = () => React.useContext(FokusarkDataContext);
