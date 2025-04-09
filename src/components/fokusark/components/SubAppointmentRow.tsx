
import React from "react";
import { RowRendererProps } from "react-data-grid";
import { FokusarkRow } from "../utils/dataGridUtils";

// Use the RowRendererProps interface from react-data-grid to correctly type our component
interface SubAppointmentRowProps extends RowRendererProps<FokusarkRow> {}

const SubAppointmentRow: React.FC<SubAppointmentRowProps> = (props) => {
  const isSubAppointment = props.row.isSubAppointment;
  
  return (
    <div
      {...props}
      className={`rdg-row ${isSubAppointment ? 'bg-muted/20' : ''} ${props.className}`}
      style={{
        ...props.style,
        paddingLeft: isSubAppointment ? '20px' : undefined
      }}
    />
  );
};

export default SubAppointmentRow;
