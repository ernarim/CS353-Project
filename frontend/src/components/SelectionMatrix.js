import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useParams } from "react-router-dom";
import Seat from "./Seat";
import SeatHeader from "./SeatHeader";
import Axios from "../Axios";

export default function SelectionMatrix({
  rows,
  columns,
  getSeats = {},
  currentSeats,
  flush = false,
  disableSelection = false,
  header = [true, true, true, true],
  cartId = null,
}) {
  const { event_id } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [isRemainingSelectedSeats, setIsRemainingSelectedSeats] =
    useState(false);
  const [test, setTest] = useState(false);

  useEffect(() => {
    if (!isRemainingSelectedSeats) return;
    function handleBeforeUnload(event) {
      console.log(selectedSeats);
      unreserveSelectedSeats();
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload, {
      capture: true,
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload, {
        capture: true,
      });
    };
  }, [isRemainingSelectedSeats]);

  useEffect(() => {
    console.log("Current Seats:", selectedSeats);
  }, [test]);

  useEffect(() => {
    getSeats(selectedSeats);
  }, [selectedSeats]);

  useEffect(() => {
    if (selectedSeats.length > 0) {
      unreserveSelectedSeats();
    }
    for (let i = 0; i < selectedSeats.length; i++) {
      seatMatrix[selectedSeats[i].row - 1][
        selectedSeats[i].column - 1
      ].isReserved = false;
      seatMatrix[selectedSeats[i].row - 1][
        selectedSeats[i].column - 1
      ].lastReserver = null;
    }
    setSelectedSeats([]);
    setIsRemainingSelectedSeats(false);
  }, [flush]);

  const unreserveSelectedSeats = () => {
    const data = {
      event_id: event_id,
      user_id: localStorage.getItem("userId"),
      category_name: currentSeats[0][0].category_name,
      cart_id: cartId,
    };
    Axios.post("/selection/unreserve", data)
      .then((response) => {
        const status = response.data.status;
        if (status === "unreserved") {
          message.info("All selected seats are unreserved successfully!");
          setSelectedSeats([]);
        }
      })
      .finally(() => {
        setTest(!test);
      })
      .catch((error) => {
        console.log(error);
        message.error("Failed to unreserve the selected seats!");
      });
  };

  const handleSeatClick = (row, column) => {
    const data = {
      event_id: event_id,
      row_number: row,
      column_number: column,
      user_id: localStorage.getItem("userId"),
    };
    Axios.post("/selection/reserve", data)
      .then((response) => {
        const status = response.data.status;
        const newSelectedSeats = selectedSeats.flat(2);

        if (status === "reserved" || status === "unreserved") {
          if (status === "reserved") {
            message.success("Seat reserved successfully!");
          } else if (status === "unreserved") {
            message.info("Seat unreserved successfully!");
          }
          const index = newSelectedSeats.findIndex(
            (seat) => seat.row === row && seat.column === column
          );
          if (index === -1) {
            newSelectedSeats.push(seatMatrix[row - 1][column - 1]);
            if (!isRemainingSelectedSeats) {
              setIsRemainingSelectedSeats(true);
            }
          } else {
            newSelectedSeats.splice(index, 1);
            if (newSelectedSeats.length === 0) {
              setIsRemainingSelectedSeats(false);
            }
          }
          setSelectedSeats(newSelectedSeats);
        }

        if (status === "occupied" || status === "sold") {
          if (status === "occupied") {
            seatMatrix[row - 1][column - 1].isReserved = true;
            message.warning("Seat is already reserved!");
          } else if (status === "sold") {
            seatMatrix[row - 1][column - 1].isAvailable = false;
            message.error("Seat is already sold!");
          }
        }
      })
      .finally(() => {
        setTest(!test);
      })
      .catch((error) => {
        console.log(error);
        message.error("Failed to reserve the seat!");
      });
  };

  useEffect(() => {
    while (currentSeats.length <= 0) {
      return;
    }
    let seatMatrix = [];
    for (let i = 0; i < rows; i++) {
      seatMatrix.push([]);
      for (let j = 0; j < columns; j++) {
        const seat = {
          row: i + 1,
          column: j + 1,
          isActive: false,
          isAvailable: false,
          isReserved: false,
          show: false,
          lastReserver: null,
          ticketId: null,
        };
        seatMatrix[i].push(seat);
      }
    }
    let row = 0;
    let column = 0;
    for (let i = 0; i < seatMatrix.length; i++) {
      for (let j = 0; j < seatMatrix[i].length; j++) {
        if (
          seatMatrix[i][j].row === currentSeats[row][column]?.row_number &&
          seatMatrix[i][j].column === currentSeats[row][column].column_number
        ) {
          seatMatrix[i][j].isActive = true;
          seatMatrix[i][j].isAvailable = currentSeats[row][column].is_available;
          seatMatrix[i][j].isReserved = currentSeats[row][column].is_reserved;
          seatMatrix[i][j].show = currentSeats[row][column].show;
          seatMatrix[i][j].lastReserver =
            currentSeats[row][column].last_reserver;
          seatMatrix[i][j].ticketId = currentSeats[row][column].ticket_id;
          column++;
        }
      }
      row++;
      column = 0;
    }
    setSeatMatrix(seatMatrix);
  }, [currentSeats]);

  return (
    <>
      <SeatHeader
        full={header[0]}
        empty={header[1]}
        disabled={header[2]}
        selected={header[3]}
        is_draggable={false}
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
                  selectedSeat.row === seat.row &&
                  selectedSeat.column === seat.column
              );

              if (seat.isActive) {
                return (
                  <div
                    key={j}
                    style={{
                      marginRight: 5,
                      userSelect: "none", // Disable text selection
                    }}
                  >
                    <Seat
                      number={seat.row + "-" + seat.column}
                      isActive={seat.isActive}
                      isClicked={isSelected}
                      isOccupied={!seat.isAvailable || seat.isReserved}
                      isDisabled={!seat.show}
                      onSeatClick={handleSeatClick}
                      disableSelection={disableSelection}
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
