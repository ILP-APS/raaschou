import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import FokusarkDescription from "./FokusarkDescription";
import ProjectsTable from "./ProjectsTable";

const FokusarkContent: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    
    try {
      // Call the n8n webhook to trigger data synchronization
      await fetch('https://teameasyai.app.n8n.cloud/webhook/6459958a-2e5b-450e-aa6f-a895721d3ac4', {
        method: 'GET',
      });
      
      console.log('Data update workflow triggered successfully');
    } catch (error) {
      console.error('Error triggering data update:', error);
    }

    // Keep button disabled for 20 seconds as the data refresh takes time
    setTimeout(() => {
      setIsUpdating(false);
    }, 20000);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
          <Button 
            onClick={handleUpdate}
            disabled={isUpdating}
            variant="outline"
            className="gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opdaterer...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Opdater
              </>
            )}
          </Button>
        </div>
        <FokusarkDescription />
      </div>
      
      <div className="flex-1">
        <ProjectsTable />
      </div>
    </div>
  );
};

export default FokusarkContent;
