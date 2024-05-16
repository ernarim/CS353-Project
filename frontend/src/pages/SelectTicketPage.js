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
import Axios from "../Axios";
import "../style/SelectedTicketPage.css";
import SelectionMatrix from "../components/SelectionMatrix";

export function SelectTicketPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { event_id } = useParams();
  const [form, buyForm] = Form.useForm();

  const [selectedSeats, setSelectedSeats] = useState([]);

  const [categorySeats, setCategorySeats] = useState([]);

  const [venueRows, setVenueRows] = useState(0);
  const [venueColumns, setVenueColumns] = useState(0);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [flushSeatMatrix, setFlushSeatMatrix] = useState(false);

  useEffect(() => {
    getVenue();
    fetchTicketCategories();
    fetchEventSeats();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategorySeats();
      console.log("Selected Category:", selectedCategory);
    }
    flushSeatMatrix ? setFlushSeatMatrix(false) : setFlushSeatMatrix(true);
  }, [selectedCategory]);

  const fetchTicketCategories = async () => {
    const response = await Axios.get(`/ticket_category/${event_id}`);
    setCategories(response.data);
    setSelectedCategory(response.data[0].category_name);
    form.setFieldsValue({ category: response.data[0].category_name });
  };

  const fetchCategorySeats = async () => {
    const response = await Axios.get(
      `/event/${event_id}/seating_plan/${selectedCategory}`
    );
    let newSeats = [];
    for (let i = 0; i < categorySeats.length; i++) {
      newSeats.push([]);
      for (let j = 0; j < categorySeats[i].length; j++) {
        let seat = categorySeats[i][j];
        seat.show = false;
        newSeats[i].push(seat);
      }
    }

    for (let i = 0, t_row = 0; i < categorySeats.length; i++, t_row++) {
      if (response.data[i].length === 0) continue;
      for (let j = 0, t_column = 0; j < categorySeats[i].length; j++) {
        if (
          categorySeats[i][j].row_number ===
            response.data[t_row][t_column].row_number &&
          categorySeats[i][j].column_number ===
            response.data[t_row][t_column].column_number
        ) {
          newSeats[i][j].show = true;
          t_column++;
        }
        if (t_column === response.data[t_row].length) {
          break;
        }
      }
    }
    setCategorySeats(newSeats);
  };

  const fetchEventSeats = async () => {
    const response = await Axios.get(`/event/${event_id}/seating_plan`);
    setCategorySeats(response.data);
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
        navigate("/home");
      },
      onCancel() {
        console.log("Cancel operation was aborted.");
      },
    });
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
                  Row: {seat.row}, Column: {seat.column}
                </p>
              ))}
            </Card>
          </Card>
        </Col>
        <Col span={16} className="loc-col">
          <Card title="Select Seat" className="loc-col-card">
            <SelectionMatrix
              rows={venueRows}
              columns={venueColumns}
              getSeats={getSeats}
              currentSeats={categorySeats}
              flush={flushSeatMatrix}
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
