
import { useState, useEffect } from "react";
import { User } from "@/types/appointment";
import { useToast } from "@/hooks/use-toast";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        
        // Create mock users instead of API fetching
        const mockUsers: User[] = [
          { hnUserID: 42, name: "John Doe", username: "john.doe" },
          { hnUserID: 43, name: "Jane Smith", username: "jane.smith" },
          { hnUserID: 44, name: "Peter Jensen", username: "peter.jensen" },
          { hnUserID: 45, name: "Marie Hansen", username: "marie.hansen" },
          { hnUserID: 46, name: "Thomas Nielsen", username: "thomas.nielsen" }
        ];
        
        setUsers(mockUsers);
      } catch (err) {
        console.error("Error setting up mock users:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Error loading users",
          description: "Failed to set up mock users data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  return { users, isLoading, error };
};
