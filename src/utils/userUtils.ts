
import { toast } from "sonner";

interface UserResponse {
  hnUserID: number;
  name: string;
  username: string;
}

const userCache = new Map<number, string>();

/**
 * Fetch user details by user ID from the API
 */
export async function fetchUserById(userId: number): Promise<UserResponse | null> {
  try {
    const apiUrl = `https://publicapi.e-regnskab.dk/User/${userId}`;
    const apiKey = 'w9Jq5NiTeOIpXfovZ0Hf1jLnM:pGwZ';
    
    console.log(`Fetching user with ID: ${userId}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'text/plain',
        'ApiKey': apiKey
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status}`, errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const userData = await response.json();
    console.log(`Successfully fetched user: ${userData.name} (ID: ${userData.hnUserID})`);
    
    return userData;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    return null;
  }
}

/**
 * Get user name by ID, with caching for performance
 */
export async function getUserName(userId: number): Promise<string> {
  // Check cache first
  if (userCache.has(userId)) {
    return userCache.get(userId) as string;
  }
  
  try {
    const user = await fetchUserById(userId);
    
    if (user && user.name) {
      // Store in cache
      userCache.set(userId, user.name);
      return user.name;
    }
    
    return `User ${userId}`;
  } catch (error) {
    console.error(`Error getting user name for ID ${userId}:`, error);
    return `User ${userId}`;
  }
}

/**
 * Load and cache multiple users at once for better performance
 */
export async function preloadUsers(userIds: number[]): Promise<void> {
  const uniqueIds = [...new Set(userIds)].filter(id => !userCache.has(id));
  
  if (uniqueIds.length === 0) {
    console.log("No new users to preload, all in cache");
    return;
  }
  
  console.log(`Preloading ${uniqueIds.length} users...`);
  
  try {
    const fetchPromises = uniqueIds.map(id => fetchUserById(id));
    const results = await Promise.allSettled(fetchPromises);
    
    let loaded = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        userCache.set(uniqueIds[index], result.value.name);
        loaded++;
      }
    });
    
    console.log(`Successfully preloaded ${loaded} out of ${uniqueIds.length} users`);
  } catch (error) {
    console.error("Error preloading users:", error);
    toast("Failed to load some user information");
  }
}
