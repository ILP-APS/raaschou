
import { useTableData } from "./useTableData";
import { useUsers } from "./useUsers";
import { useState, useEffect } from "react";

export const useFokusarkData = () => {
  const { tableData: initialData, isLoading: isLoadingInitial } = useTableData();
  const { users } = useUsers();
  const [isDataReady, setIsDataReady] = useState(false);
  
  // Only mark data as ready when initialData has been loaded
  useEffect(() => {
    if (!isLoadingInitial && initialData.length > 0 && !isDataReady) {
      setIsDataReady(true);
    }
  }, [initialData, isLoadingInitial, isDataReady]);
  
  return { 
    tableData: initialData, 
    isLoading: isLoadingInitial || !isDataReady, 
    users 
  };
};
