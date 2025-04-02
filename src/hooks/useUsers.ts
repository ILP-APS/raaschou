
import { useState, useEffect } from "react";
import { fetchUsers } from "@/utils/apiUtils";
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
        const usersList = await fetchUsers();
        setUsers(usersList);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Error loading users",
          description: "Failed to fetch users data.",
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
