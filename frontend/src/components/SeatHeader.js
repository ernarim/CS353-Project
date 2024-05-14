import React, { useState } from "react";
import "../style/SeatHeader.css";

export default function SeatHeader({
  full,
  empty,
  selected,
  disabled,
  onModeChange,
  is_draggable = true,
}) {
  const [activeMode, setActiveMode] = useState("selected");

  const handleModeChange = (mode) => {
    if (is_draggable) {
      setActiveMode(mode);
      onModeChange(mode);
    }
  };

  return (
    <>
      <div className="seat-area-header">
        {full && <span className="full">Full</span>}
        {empty && <span className="empty">Empty</span>}
        <span
          className={`selected ${
            activeMode === "selected" && is_draggable ? "active" : ""
          }`}
          onClick={() => handleModeChange("selected")}
        >
          Selected
        </span>
        <span
          className={`disabled ${activeMode === "disabled" ? "active" : ""}`}
          onClick={() => handleModeChange("disabled")}
        >
          Disabled
        </span>
      </div>
    </>
  );
}
