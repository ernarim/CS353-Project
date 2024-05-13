import React from "react";
import "../style/SeatHeader.css";

export default function SeatHeader({ full, empty, selected, disabled }) {
  const fullStyle = full ? "" : "disabled";
  return (
    <>
      <div className="seat-area-header">
        {full && <span className="full">Full</span>}
        {empty && <span className="empty">Empty</span>}
        {selected && <span className="selected">Selected</span>}
        {disabled && <span className="disabled">Disabled</span>}
      </div>
    </>
  );
}
