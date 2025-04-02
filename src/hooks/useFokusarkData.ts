
import { useTableData } from "./useTableData";
import { useUsers } from "./useUsers";

export const useFokusarkData = () => {
  const { tableData, isLoading, error } = useTableData();
  const { users } = useUsers();
  
  return { tableData, isLoading, users, error };
};
