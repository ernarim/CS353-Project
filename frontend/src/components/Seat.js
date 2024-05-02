import React from 'react';
import '../style/Seat.css';
export default function Seat({number, isActive}){
    const activeStyle = (isActive) ? "seat_active" : "seat_inactive";
    return(
        <>
        <div className={activeStyle}><span>{number}</span></div>
        </>
    )
}