import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserResponse {
  hnUserID: number;
  name: string;
  username: string;
}

const userCache = new Map<number, string>();

export async function fetchUserById(userId: number): Promise<UserResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke("fetch-user-by-id", {
      body: { user_ids: [userId] },
    });
    if (error) throw error;
    return data?.[userId] || null;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    return null;
  }
}

export async function getUserName(userId: number): Promise<string> {
  if (userCache.has(userId)) {
    return userCache.get(userId) as string;
  }

  try {
    const user = await fetchUserById(userId);
    if (user && user.name) {
      userCache.set(userId, user.name);
      return user.name;
    }
    return `User ${userId}`;
  } catch (error) {
    console.error(`Error getting user name for ID ${userId}:`, error);
    return `User ${userId}`;
  }
}

export async function preloadUsers(userIds: number[]): Promise<void> {
  const uniqueIds = [...new Set(userIds)].filter(id => !userCache.has(id));

  if (uniqueIds.length === 0) return;

  try {
    const { data, error } = await supabase.functions.invoke("fetch-user-by-id", {
      body: { user_ids: uniqueIds },
    });
    if (error) throw error;

    let loaded = 0;
    for (const id of uniqueIds) {
      if (data?.[id]?.name) {
        userCache.set(id, data[id].name);
        loaded++;
      }
    }
    console.log(`Preloaded ${loaded}/${uniqueIds.length} users`);
  } catch (error) {
    console.error("Error preloading users:", error);
    toast("Failed to load some user information");
  }
}
