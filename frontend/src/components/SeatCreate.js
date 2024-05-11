import React, { useEffect, useState } from "react";
import "../style/Seat.css";

export default function SeatCreate({ number, color, onSeatClick }) {


    const handleClick = () => {
        if (onSeatClick) {
            onSeatClick(number); // Call onSeatClick function
        }
    };



    let seatClasses = "seat";
    

    return (
        <div className={seatClasses} onClick={handleClick} style={{backgroundColor:color }}>
            <span>{number}</span>
        </div>
    );
}
