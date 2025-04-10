
import { useState } from "react";
import { User } from "@/types/user";

export const useUsers = () => {
  const [users] = useState<User[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  // No API fetching implementation - just return empty data
  return { users, isLoading, error };
};
