
import React from "react";

interface SubAppointmentRowProps {
  isSubAppointment?: boolean;
}

const SubAppointmentRow: React.FC<SubAppointmentRowProps> = ({ isSubAppointment }) => {
  return (
    <div className="p-2 border border-dashed border-muted-foreground rounded">
      <p className="text-sm text-muted-foreground">
        SubAppointmentRow component (removed)
      </p>
    </div>
  );
};

export default SubAppointmentRow;
