import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Form, message, Select, Card, Row, Col, Spin } from "antd";
import SeatMatrix from "../components/SeatMatrix";
import Axios from "../Axios";
import "../style/SelectedTicketPage.css";

export function SelectTicketPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { event_id } = useParams();
  const [form] = Form.useForm();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [addedSeats, setAddedSeats] = useState([]);

  const [categorySeats, setCategorySeats] = useState([]);
  const [eventSeats, setEventSeats] = useState([]);

  const [venueRows, setVenueRows] = useState(0);
  const [venueColumns, setVenueColumns] = useState(0);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [flushSeatMatrix, setFlushSeatMatrix] = useState(false);

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
    setSelectedSeats([]);
    setAddedSeats([]);
    flushSeatMatrix ? setFlushSeatMatrix(false) : setFlushSeatMatrix(true);
  }, [selectedCategory]);

  useEffect(() => {
    console.log("Selected seats: ", selectedSeats);
    matchAddedSeats();
  }, [selectedSeats]);

  const matchAddedSeats = () => {
    let added = [];
    for (let i = 0; i < selectedSeats.length; i++) {
      let seat = selectedSeats[i];
      let match = false;
      for (let j = 0; j < categorySeats.length; j++) {
        if (
          seat[0] === categorySeats[j].row_number &&
          seat[1] === categorySeats[j].column_number
        ) {
          match = true;
          break;
        }
      }
      if (match) {
        added.push(seat);
      }
    }
    setAddedSeats(added);
  };

  const fetchTicketCategories = async () => {
    setIsLoading(true);
    const response = await Axios.get(`/ticket_category/${event_id}`);
    setIsLoading(false);
    // console.log("Eventres:", response.data); //TEST
    setCategories(response.data);
    setSelectedCategory(response.data[0].category_name);
    form.setFieldsValue({ category: response.data[0].category_name });
  };

  const fetchCategorySeats = async () => {
    const response = await Axios.get(
      `/event/${event_id}/seating_plan/${selectedCategory}`
    );
    // console.log("S SSats:", response.data);
    setCategorySeats(response.data);
  };

  const fetchEventSeats = async () => {
    const response = await Axios.get(`/event/${event_id}/seating_plan`);
    // console.log("SEL seats:", response.data);

    let seats = [];
    for (let i = 0; i < response.data.length; i++) {
      let seat = [];
      seat[0] = response.data[i].row_number;
      seat[1] = response.data[i].column_number;
      seats.push(seat);
    }
    setEventSeats(seats);
    // console.log("S seats:", categorySeats);
  };

  const getSeats = (seats) => {
    setSelectedSeats(seats);
  };

  const getVenue = async () => {
    try {
      const event = await Axios.get(`/event/${event_id}`);
      const venue = await Axios.get(`/venue/${event.data.venue.venue_id}`);
      setVenueRows(venue.data.row_count);
      setVenueColumns(venue.data.column_count);
      // console.log(event.data);
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

  const handleReserve = async (seat) => {
    // try {
    //   console.log("Seat:", seat);
    //   let data = {
    //     event_id: event_id,
    //     row_number: seat[0][0],
    //     column_number: seat[0][1],
    //   };
    //   const response = await Axios.post("/selection/reserve", data);
    //   message.success("Seat reserved successfully!");
    // } catch (error) {
    //   console.log(error);
    // }
  };

  return !isLoading ? (
    <>
      <Row className="loc-row" justify={"center"}>
        <Col span={8} className="loc-col">
          <Card title="Select Category" className="loc-col-card">
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
            <Card title="Selected Seats">
              {addedSeats.map((seat, index) => (
                <p key={index}>
                  Row: {seat[0]}, Column: {seat[1]}
                </p>
              ))}
            </Card>
          </Card>
        </Col>
        <Col span={16} className="loc-col">
          <Card title="Select Seat" className="loc-col-card">
            <SeatMatrix
              rows={venueRows}
              columns={venueColumns}
              available_seats={eventSeats}
              active_seats={categorySeats}
              onSeatClick={handleReserve}
              getSeats={getSeats}
              is_draggable={false}
              header={[true, true, true, true]}
              flush={flushSeatMatrix}
            />
          </Card>
        </Col>
      </Row>
    </>
  ) : (
    <>
      <Spin spinning={isLoading} fullscreen />
    </>
  );
}
