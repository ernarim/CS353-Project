import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import Seat from "./Seat";
import SeatHeader from "./SeatHeader";

export default function SeatMatrix({
  rows,
  columns,
  available_seats,
  onSeatClick,
}) {
  if (onSeatClick == null) {
    onSeatClick = () => {};
  }

  const [selectedSeats, setSelectedSeats] = useState([]); // [row, column]
  useEffect(() => {
    console.log(selectedSeats);
  }, [selectedSeats]);

  useEffect(() => {
    console.log("Rows changed: ", rows);
    // Handle selected but now disabled seats, if any seat with row higher than rows then remove it from selectedSeats
    const newSelectedSeats = selectedSeats.filter((seat) => seat[0] <= rows);
    setSelectedSeats(newSelectedSeats);
    onSeatClick(newSelectedSeats); // NOT SURE
  }, [rows]);

  useEffect(() => {
    console.log("Columns changed: ", columns);
    // Handle selected but now disabled seats, if any seat with column higher than rows then remove it from selectedSeats
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

  const seatMatrix = [];
  for (let i = 0; i < rows; i++) {
    seatMatrix.push([]);
    for (let j = 0; j < columns; j++) {
      const seat = [i + 1, j + 1, true];
      seatMatrix[i].push(seat);
    }
  }

  const disableSeats = (arr) => {
    let curr_available = 0;
    seatMatrix.forEach((row) => {
      row.forEach((seat) => {
        if (
          curr_available < arr.length &&
          arr[curr_available][0] == seat[0] &&
          arr[curr_available][1] == seat[1]
        ) {
          curr_available++;
        } else {
          seat[2] = false;
        }
      });
    });
  };
  disableSeats(available_seats);

  return (
    <>
      <SeatHeader />
      {seatMatrix.map((row, i) => (
        <Row key={i} style={{ marginBottom: 5 }} gutter={[8, 8]}>
          {row.map((seat, j) => {
            if (!seat[2]) {
              return (
                <Col key={j}>
                  <Seat
                    number={seat[0] + "-" + seat[1]}
                    isActive={true}
                    onSeatClick={() => handleSeatClick(seat[0], seat[1])}
                  />
                </Col>
              );
            } else {
              return (
                <Col key={j}>
                  <Seat isActive={false} />
                </Col>
              );
            }
          })}
        </Row>
      ))}
    </>
  );
}
