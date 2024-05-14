import React, { useState } from "react";
import "../style/Seat.css";
export default function Seat({
  number,
  isActive,
  isClicked,
  onSeatClick,
  isDisabled,
  isOccupied,
}) {
  const [isClicked_, setIsClicked_] = useState(false);
  let status = isClicked ? "selected" : "active";
  status = isOccupied ? "occupied" : status;
  status = isDisabled ? "disabled" : status;
  status = isActive ? status : "inactive";

  const handleClick = () => {
    if (onSeatClick) {
      if (isActive && !isDisabled && !isOccupied) {
        onSeatClick(number); // Call onSeatClick function
      }
    }
    if (isActive) {
      setIsClicked_(!isClicked_);
    }
  };

  return (
    <>
      <div className={`seat ${status}`} onClick={handleClick}>
        <span>{number}</span>
      </div>
    </>
  );
}
