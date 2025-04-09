
import React from "react";

const FokusarkDescription: React.FC = () => {
  return (
    <p className="text-sm text-muted-foreground mb-6">
      This table displays open appointments from e-regnskab with Nr., Subject, and Responsible Person.
      Only showing appointments that are not done and have a Tilbud value greater than 40,000 DKK.
      <br />
      <span className="text-primary font-medium">
        Materialer, Projektering, and Produktion calculations are automatically handled by the system.
        Click "Refresh Realized Hours" to fetch the latest data from the API.
      </span>
    </p>
  );
};

export default FokusarkDescription;
