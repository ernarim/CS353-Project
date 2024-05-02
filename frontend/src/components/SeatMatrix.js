import React from "react";
import { Row, Col } from "antd";
import Seat from "./Seat";
import SeatHeader from "./SeatHeader";

export default function SeatMatrix({
  rows,
  columns,
  available_seats,
  onSeatClick,
}) {
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
                    onSeatClick={() => onSeatClick(seat[0], seat[1])}
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
