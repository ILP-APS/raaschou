
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RefreshRealizedHoursButton: React.FC = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshRealizedHours = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      
      toast({
        title: "Refresh functionality",
        description: "This feature needs to be implemented for the new system.",
      });
      
    } catch (error) {
      console.error("Error refreshing realized hours:", error);
      toast({
        title: "Error refreshing realized hours",
        description: "There was a problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      onClick={handleRefreshRealizedHours} 
      className="gap-2"
      variant="outline"
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Realized Hours'}
    </Button>
  );
};

export default RefreshRealizedHoursButton;
