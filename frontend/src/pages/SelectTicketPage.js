import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  message,
  Select,
  Card,
  Row,
  Col,
  Spin,
  Button,
  Divider,
  Modal,
} from "antd";
import SeatMatrix from "../components/SeatMatrix";
import Axios from "../Axios";
import "../style/SelectedTicketPage.css";

export function SelectTicketPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSeatLoading, setIsSeatLoading] = useState(false);
  const { event_id } = useParams();
  const [form, buyForm] = Form.useForm();

  const [selectedSeats, setSelectedSeats] = useState([]);
  // const [addedSeats, setAddedSeats] = useState([]);
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
      fetchCategorySeats();
    }
    setSelectedSeats([]);
    // setAddedSeats([]);
    flushSeatMatrix ? setFlushSeatMatrix(false) : setFlushSeatMatrix(true);
  }, [selectedCategory]);

  // useEffect(() => {
  //   console.log("Selected seats: ", selectedSeats);
  //   matchAddedSeats();
  // }, [selectedSeats]);

  // const matchAddedSeats = () => {
  //   let added = [];
  //   for (let i = 0; i < selectedSeats.length; i++) {
  //     let seat = selectedSeats[i];
  //     let match = false;
  //     for (let j = 0; j < categorySeats.length; j++) {
  //       if (
  //         seat[0] === categorySeats[j].row_number &&
  //         seat[1] === categorySeats[j].column_number
  //       ) {
  //         match = true;
  //         break;
  //       }
  //     }
  //     if (match) {
  //       added.push(seat);
  //     }
  //   }
  //   setAddedSeats(added);
  // };

  const fetchTicketCategories = async () => {
    setIsLoading(true);
    const response = await Axios.get(`/ticket_category/${event_id}`);
    setIsLoading(false);
    setCategories(response.data);
    setSelectedCategory(response.data[0].category_name);
    form.setFieldsValue({ category: response.data[0].category_name });
  };

  const fetchCategorySeats = async () => {
    const response = await Axios.get(
      `/event/${event_id}/seating_plan/${selectedCategory}`
    );
    setCategorySeats(response.data);
  };

  const fetchEventSeats = async () => {
    const response = await Axios.get(`/event/${event_id}/seating_plan`);

    let seats = [];
    for (let i = 0; i < response.data.length; i++) {
      let seat = [];
      seat[0] = response.data[i].row_number;
      seat[1] = response.data[i].column_number;
      seats.push(seat);
    }
    setEventSeats(seats);
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
    } catch (error) {
      console.log(error.detail);
    }
  };

  const handleAddToCart = () => {
    // if (record.select > 0 && record.select <= record.available) {
    //   // Process the ticket selection, e.g., add to cart
    //   message.success(`${record.select} tickets added to the cart`);
    // } else {
    //   message.error("Invalid number of tickets selected");
    // }
    // console.log("Added to cart:", addedSeats);
    // console.log("Selected Seats:", selectedSeats);

    if (selectedSeats.length === 0) {
      message.warning("Please select a seat!");
      return;
    }
    Modal.confirm({
      title: "Are you sure you want to add these seats to the cart?",
      content: selectedSeats.map((seat, index) => (
        <p key={index}>
          Row: {seat[0]}, Column: {seat[1]}
        </p>
      )),
      okText: "Yes",
      okType: "primary",
      cancelText: "No",
      onOk() {
        console.log("OK:", selectedSeats);
        navigate("/");
      },
      onCancel() {
        console.log("Cancel operation was aborted.");
      },
    });
  };

  const handleReserve = async (row, column) => {
    try {
      console.log("Seat:", row, column); //TEST
      let data = {
        event_id: event_id,
        row_number: row,
        column_number: column,
      };
      setIsSeatLoading(true);
      const response = await Axios.post("/selection/reserve", data);
      const status = response.data.status;
      console.log("Reserve:", response.data);
      setIsSeatLoading(false);

      if (status === "reserved") {
        message.success("Seat reserved successfully!");
      }
      if (status === "unreserved") {
        message.info("Seat unreserved successfully!");
      }
    } catch (error) {
      setIsSeatLoading(false);
      message.error("Failed to reserve seat!");
      console.log(error);
    }
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
              {selectedSeats.map((seat, index) => (
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
              isLoading={isSeatLoading}
            />

            <Divider />
            <Form form={buyForm} layout="horizontal" onFinish={handleAddToCart}>
              <Form.Item
                name="buy"
                style={{
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Button type="primary" htmlType="submit">
                  ADD TO CART
                </Button>
              </Form.Item>
            </Form>
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
