
import React from "react";
import { RowRendererProps } from "react-data-grid";
import { FokusarkRow } from "../utils/dataGridUtils";

// Define a proper type alias that explicitly includes all the properties we need
type SubAppointmentRowProps<R> = RowRendererProps<R>;

const SubAppointmentRow: React.FC<SubAppointmentRowProps<FokusarkRow>> = ({
  row,
  className,
  style,
  ...props
}) => {
  const isSubAppointment = row.isSubAppointment;
  
  return (
    <div
      {...props}
      className={`rdg-row ${isSubAppointment ? 'bg-muted/20' : ''} ${className}`}
      style={{
        ...style,
        paddingLeft: isSubAppointment ? '20px' : undefined
      }}
    />
  );
};

export default SubAppointmentRow;
