import React, { useEffect, useState } from "react";
import { Row, Col, Spin } from "antd";
import Seat from "./Seat";
import SeatHeader from "./SeatHeader";

export default function SeatMatrix({
  rows,
  columns,
  getSeats = {},
  flush = false,
}) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [mode, setMode] = useState("selected");

  useEffect(() => {
    getSeats(selectedSeats);
  }, [selectedSeats]);

  useEffect(() => {
    setSelectedSeats([]);
  }, [flush]);

  useEffect(() => {
    const newSelectedSeats = selectedSeats.filter((seat) => seat[0] <= rows);
    setSelectedSeats(newSelectedSeats);
  }, [rows]);

  useEffect(() => {
    const newSelectedSeats = selectedSeats.filter((seat) => seat[1] <= columns);
    setSelectedSeats(newSelectedSeats);
  }, [columns]);

  const handleSeatClick = (row, column) => {
    const newSelectedSeats = selectedSeats.slice();
    const index = newSelectedSeats.findIndex(
      (seat) => seat[0] === row && seat[1] === column
    );
    if (index === -1) {
      newSelectedSeats.push([row, column]);
    } else {
      newSelectedSeats.splice(index, 1);
    }
    setSelectedSeats(newSelectedSeats);
  };

  const handleMouseDown = (row, column) => {
    setIsDragging(true);
    setDragStart({ row, column });
    const seatNumber = `${row}-${column}`;
  };

  const handleMouseOver = (row, column) => {
    if (isDragging && dragStart) {
      const rowStart = Math.min(dragStart.row, row);
      const rowEnd = Math.max(dragStart.row, row);
      const columnStart = Math.min(dragStart.column, column);
      const columnEnd = Math.max(dragStart.column, column);

      const newSelectedSeats = [];
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = columnStart; c <= columnEnd; c++) {
          newSelectedSeats.push([r, c]);
        }
      }

      if (mode === "selected") {
        const updatedSeats = [...selectedSeats];
        newSelectedSeats.forEach((seat) => {
          if (!updatedSeats.some((s) => s[0] === seat[0] && s[1] === seat[1])) {
            updatedSeats.push(seat);
          }
        });
        setSelectedSeats(updatedSeats);
      } else if (mode === "disabled") {
        const updatedSeats = selectedSeats.filter((seat) => {
          return !newSelectedSeats.some(
            (s) => s[0] === seat[0] && s[1] === seat[1]
          );
        });
        setSelectedSeats(updatedSeats);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  useEffect(() => {
    console.log("Adding event listener");
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const [seatMatrix, setSeatMatrix] = useState([]);
  useEffect(() => {
    let seatMatrix = [];
    //populate seatMatrix
    for (let i = 0; i < rows; i++) {
      seatMatrix.push([]);
      for (let j = 0; j < columns; j++) {
        // row0, column1, isActive2, isClicked3, isOccupied4, isDisabled
        const seat = [i + 1, j + 1, false, false, false, false];
        seatMatrix[i].push(seat);
      }
    }

    setSeatMatrix(seatMatrix);
  }, [rows, columns]);

  return (
    <>
      <SeatHeader
        full={false}
        empty={false}
        disabled={true}
        selected={true}
        onModeChange={setMode}
        is_draggable={true}
      />
      <div
        style={{
          overflow: "auto",
          maxHeight: "90vh",
          maxWidth: "90vh",
          padding: "30px",
          border: "1px solid #000",
          userSelect: "none", // Disable text selection
        }}
        onMouseUp={handleMouseUp}
      >
        {seatMatrix.map((row, i) => (
          <div
            key={i}
            style={{
              marginBottom: 10,
              display: "flex",
              flexDirection: "row",
            }}
          >
            {row.map((seat, j) => {
              const isSelected = selectedSeats.some(
                (selectedSeat) =>
                  selectedSeat[0] === seat[0] && selectedSeat[1] === seat[1]
              );

              if (!seat[2]) {
                return (
                  <div
                    key={j}
                    style={{
                      marginRight: 5,
                      userSelect: "none", // Disable text selection
                    }}
                    onMouseDown={() => handleMouseDown(seat[0], seat[1])}
                    onMouseOver={() => handleMouseOver(seat[0], seat[1])}
                  >
                    <Seat
                      number={seat[0] + "-" + seat[1]}
                      isActive={true}
                      isClicked={isSelected}
                      isOccupied={seat[4]}
                      isDisabled={seat[5]}
                      onSeatClick={handleSeatClick}
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    key={j}
                    style={{
                      marginRight: 5,
                      userSelect: "none", // Disable text selection
                    }}
                  >
                    <Seat isActive={false} />
                  </div>
                );
              }
            })}
          </div>
        ))}
      </div>
    </>
  );
}
