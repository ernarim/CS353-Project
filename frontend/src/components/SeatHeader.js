import React from "react";
import "../style/SeatHeader.css";

export default function SeatHeader() {
  return (
    <>
      <div className="seat-area-header">
        <span className="full">Dolu</span>
        <span className="empty">Boş</span>
        <span className="selected">Seçilen</span>
        <span className="disabled">Satın Alınamaz</span>
      </div>
    </>
  );
}
