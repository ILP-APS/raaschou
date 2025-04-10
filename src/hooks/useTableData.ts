
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useTableData = () => {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const refetchData = useCallback(() => {
    // No real implementation since there's no data source
    toast({
      title: "Refetch attempted",
      description: "No data source is configured.",
      variant: "default",
    });
  }, [toast]);
  
  return { tableData, isLoading, error, refetchData };
};
