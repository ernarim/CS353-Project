import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import Seat from "./Seat";
import SeatHeader from "./SeatHeader";

export default function SeatMatrix({
  rows,
  columns,
  available_seats,
  onSeatClick,
  getSeats = {},
  header,
}) {
  if (onSeatClick === undefined) {
    onSeatClick = () => {};
  }

  const [selectedSeats, setSelectedSeats] = useState([1]); // [row, column]
  useEffect(() => {
    getSeats(selectedSeats);
  }, [selectedSeats]);

  useEffect(() => {
    const newSelectedSeats = selectedSeats.filter((seat) => seat[0] <= rows);
    setSelectedSeats(newSelectedSeats);
    onSeatClick(newSelectedSeats); // NOT SURE
  }, [rows]);

  useEffect(() => {
    const newSelectedSeats = selectedSeats.filter((seat) => seat[1] <= columns);
    setSelectedSeats(newSelectedSeats); // NOT SURE
  }, [columns]);

  const handleSeatClick = (row, column) => {
    const newSelectedSeats = selectedSeats.slice();
    const index = newSelectedSeats.findIndex(
      (seat) => seat[0] == row && seat[1] == column
    );
    if (index == -1) {
      newSelectedSeats.push([row, column]);
    } else {
      newSelectedSeats.splice(index, 1);
    }
    setSelectedSeats(newSelectedSeats);
    onSeatClick(newSelectedSeats);
  };

  const [seatMatrix, setSeatMatrix] = useState([]);
  useEffect(() => {
    let seatMatrix = [];
    for (let i = 0; i < rows; i++) {
      seatMatrix.push([]);
      for (let j = 0; j < columns; j++) {
        const seat = [i + 1, j + 1, false];
        seatMatrix[i].push(seat);
      }
    }
    if (available_seats.length > 0) {
      seatMatrix.forEach((row) => {
        row.forEach((seat) => {
          seat[2] = true;
        });
      });
      seatMatrix.forEach((row) => {
        row.forEach((seat) => {
          for (let i = 0; i < available_seats.length; i++) {
            if (
              available_seats[i][0] == seat[0] &&
              available_seats[i][1] == seat[1]
            ) {
              seat[2] = false;
              break;
            }
          }
        });
      });
    }

    setSeatMatrix(seatMatrix);
    console.log("Seat Matrix: ", seatMatrix.length);
  }, [rows, columns]);

  return (
    <>
      <SeatHeader
        full={header[0]}
        empty={header[1]}
        disabled={header[2]}
        selected={header[3]}
      />
      <div
        style={{
          overflow: "auto",
          maxHeight: "90vh",
          maxWidth: "90vh",
          padding: "30px",
          border: "1px solid #000",
        }}
      >
        {seatMatrix.map((row, i) => (
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              flexDirection: "row",
            }}
          >
            {row.map((seat, j) => {
              if (!seat[2]) {
                return (
                  <div
                    style={{
                      marginRight: 5,
                    }}
                  >
                    <Seat
                      number={seat[0] + "-" + seat[1]}
                      isActive={true}
                      onSeatClick={() => handleSeatClick(seat[0], seat[1])}
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    style={{
                      marginRight: 5,
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
