import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Form, message, Select, Card, Row, Col } from "antd";
import SeatMatrix from "../components/SeatMatrix";
import Axios from "../Axios";
import "../style/SelectedTicketPage.css";

export function SelectTicketPage() {
  const { event_id } = useParams();
  const [form] = Form.useForm();
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [categorySeats, setCategorySeats] = useState([]);
  const [eventSeats, setEventSeats] = useState([]);

  const [venueSeats, setVenueSeats] = useState([]);
  const [venueRows, setVenueRows] = useState(0);
  const [venueColumns, setVenueColumns] = useState(0);

  const [categories, setCategories] = useState([]);
  // const [activeCategory, setActiveCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchTicketCategories();
    fetchEventSeats();
    getVenue();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      message.info(`Selected category: ${selectedCategory}`);
      fetchCategorySeats();
    }
  }, [selectedCategory]);

  const fetchTicketCategories = async () => {
    const response = await Axios.get(`/ticket_category/${event_id}`);
    // console.log("Eventres:", response.data); //TEST
    setCategories(response.data);
  };

  const fetchCategorySeats = async () => {
    const response = await Axios.get(
      `/event/${event_id}/seating_plan/${selectedCategory}`
    );
    console.log("S SSats:", response.data);
  };

  const fetchEventSeats = async () => {
    const response = await Axios.get(`/event/${event_id}/seating_plan`);
    console.log("SEL seats:", response.data);

    let seats = [];
    for (let i = 0; i < response.data.length; i++) {
      let seat = [];
      seat[0] = response.data[i].row_number;
      seat[1] = response.data[i].column_number;
      seats.push(seat);
    }
    setCategorySeats(seats);
    console.log("S seats:", categorySeats);
  };

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
      console.log(event.data);
    } catch (error) {
      console.log(error.detail);
    }
  };

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

  return (
    <>
      <Row className="loc-row" justify={"center"}>
        <Col span={8} className="loc-col">
          <Card>
            <Form form={form} layout="vertical">
              <Form.Item
                label="Select Ticket Category"
                name="category"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
              >
                <Select
                  placeholder="Ticket Category"
                  onChange={setSelectedCategory}
                >
                  {categories.map((category) => (
                    <Select.Option
                      key={category.category_name}
                      value={category.category_name}
                    >
                      {category.category_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={16} className="loc-col">
          <Card title="Select Seat">
            <SeatMatrix
              rows={venueRows}
              columns={venueColumns}
              available_seats={categorySeats}
              onSeatClick={handleReserve}
              getSeats={getSeats}
              header={[true, true, true, true]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
