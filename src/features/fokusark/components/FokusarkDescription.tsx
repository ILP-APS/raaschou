
import React from "react";

const FokusarkDescription: React.FC = () => {
  return (
    <p className="text-sm text-muted-foreground mb-6">
      This table displays all projects from the database with real-time updates. All project data is read-only except for the "Færdig% (NU)" field which you can edit by clicking on it.
      <br />
      <span className="text-primary font-medium">
        Changes to completion percentage will automatically trigger recalculations in the database.
      </span>
    </p>
  );
};

export default FokusarkDescription;
