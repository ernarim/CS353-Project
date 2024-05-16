import React, { useState } from "react";
import "../style/Seat.css";
export default function Seat({
  number,
  isActive,
  isClicked,
  onSeatClick,
  isDisabled,
  isOccupied,
  disableSelection = false,
}) {
  const [isClicked_, setIsClicked_] = useState(false);
  let status = isClicked ? "selected" : "active";
  status = isOccupied ? "occupied" : status;
  status = isDisabled ? "disabled" : status;
  status = isActive ? status : "inactive";

  const handleClick = () => {
    if (disableSelection) {
      return;
    }
    // console.log("Seat clicked: ", number);
    if (onSeatClick) {
      if (isActive && !isDisabled && !isOccupied) {
        const tmp = number.split("-");
        onSeatClick(Number(tmp[0]), Number(tmp[1])); // Call onSeatClick function
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
