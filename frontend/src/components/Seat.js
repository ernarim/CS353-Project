import React, { useState } from "react";
import "../style/Seat.css";
export default function Seat({ number, isActive, onSeatClick }) {
  const [isClicked, setIsClicked] = useState(false);

  const activeStatus = isActive ? "seat active" : "seat inactive";
  const clickedStyle = isClicked ? "selected" : "";

  const handleClick = () => {
    if (onSeatClick) {
      onSeatClick(number); // Call onSeatClick function
    }
    if (isActive) {
      setIsClicked(!isClicked);
    }
  };

  return (
    <>
      <div className={`${activeStatus} ${clickedStyle}`} onClick={handleClick}>
        <span>{number}</span>
      </div>
    </>
  );
}
