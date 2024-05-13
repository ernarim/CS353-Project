import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, InputNumber, message, Card } from "antd";
import SeatMatrix from "../components/SeatMatrix";
import Axios from "../Axios";

export function SelectTicketPage() {
  const { event_id } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [venueSeats, setVenueSeats] = useState([]);
  const [venueRows, setVenueRows] = useState(0);
  const [venueColumns, setVenueColumns] = useState(0);

  const getSeats = (seats) => {
    setSelectedSeats(seats);
  };

  const getVenue = async () => {
    try {
      const event = await Axios.get(`/event/${event_id}`);
      const venue = await Axios.get(`/venue/${event.data.venue.venue_id}`);
      setVenueSeats(venue.data.seats);
      setVenueRows(venue.data.row_count);
      setVenueColumns(venue.data.column_count);
      console.log(venueSeats);
      console.log(venueRows);
      console.log(venueColumns);
    } catch (error) {
      console.log(error.detail);
    }
  };

  useEffect(() => {
    getVenue();
  }, []);

  const [ticketData, setTicketData] = useState([
    {
      key: "1",
      category: "category A",
      available: 32,
      occupied: 78,
      select: 0,
    },
    {
      key: "2",
      category: "category B",
      available: 0,
      occupied: 110,
      select: 0,
    },
    {
      key: "3",
      category: "category C",
      available: 15,
      occupied: 75,
      select: 0,
    },
    // ... other categories
  ]);

  const handleAddToCart = (record) => {
    if (record.select > 0 && record.select <= record.available) {
      // Process the ticket selection, e.g., add to cart
      message.success(`${record.select} tickets added to the cart`);
    } else {
      message.error("Invalid number of tickets selected");
    }
  };

  // const test = async () => {
  //   try {
  //     await Axios.post("/selection/reserve", {
  //       event_id: "3bf3aa38-fee5-4ef2-9589-c6528376c04f",
  //       row_number: 1,
  //       column_number: 1,
  //     }).then((response) => {
  //       console.log(response.data);
  //     });
  //   } catch (error) {
  //     console.log(error.detail);
  //   }
  // };

  const handleReserve = (row, column) => {
    console.log(row, column);
  };

  const columns = [
    {
      title: "Ticket Type",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Available",
      dataIndex: "available",
      key: "available",
    },
    {
      title: "Occupied",
      dataIndex: "occupied",
      key: "occupied",
    },
    {
      title: "Select",
      key: "select",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.available}
          value={record.select}
          onChange={(value) => {
            const newTicketData = [...ticketData];
            const index = newTicketData.findIndex(
              (item) => item.key === record.key
            );
            newTicketData[index].select = value;
            setTicketData(newTicketData);
          }}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleAddToCart(record)}
          disabled={record.available === 0}
        >
          Add to Cart
        </Button>
      ),
    },
  ];

  // fill 2d arrsy with available seats from [1,1] to [10,10]

  const available_seats = [];
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      available_seats.push([i, j]);
    }
  }

  // discard some seats in RANDOM
  for (let i = 0; i < 30; i++) {
    available_seats.splice(
      Math.floor(Math.random() * available_seats.length),
      1
    );
    //console.log(available_seats);
  }

  return (
    <>
      <Button onClick={() => test()}>TEST</Button>
      <Card style={{ display: "flex" }}>
        <SeatMatrix
          rows={venueRows}
          columns={venueColumns}
          available_seats={venueSeats}
          onSeatClick={handleReserve}
          getSeats={getSeats}
          header={[false, false, true, true]}
        />
      </Card>
      <br />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Select Tickets</h2>
        <Table dataSource={ticketData} columns={columns} pagination={false} />
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Button type="default" style={{ marginRight: "10px" }}>
            Cancel
          </Button>
          <Button type="primary">Add to Cart</Button>
        </div>
      </div>
    </>
  );
}
