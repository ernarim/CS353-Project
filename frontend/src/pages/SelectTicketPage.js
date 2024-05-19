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
  InputNumber,
} from "antd";
import Axios from "../Axios";
import "../style/SelectedTicketPage.css";
import SelectionMatrix from "../components/SelectionMatrix";
import Seat from "../components/Seat";

const baseURLEvents = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/events/`;

export function SelectTicketPage() {
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { event_id } = useParams();
  const [form, buyForm] = Form.useForm();
  const [cartId, setCartId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [categorySeats, setCategorySeats] = useState([]);
  const [venueRows, setVenueRows] = useState(0);
  const [venueColumns, setVenueColumns] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [flushSeatMatrix, setFlushSeatMatrix] = useState(false);
  const [isSeatingPlan, setIsSeatingPlan] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    while (event_id === undefined || event_id === null) {
      console.log("Event ID is not defined yet.");
    }
    getVenue();
    fetchTicketCategories();
    fetchEventSeats();
    fetchCart();
    setIsLoading(false);
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

  const fetchCart = async () => {
    const response = await Axios.get(
      `/user/ticket_buyer/${localStorage.getItem("userId")}`
    );
    setCartId(response.data.current_cart);
  };

  const fetchEventSeats = async () => {
    const response = await Axios.get(`/event/${event_id}/seating_plan`);
    console.log("Event Seats:", response.data[0]);
    setCategorySeats(response.data);
  };

  const getSeats = (seats) => {
    setSelectedSeats(seats);
  };

  const getVenue = async () => {
    try {
      const event = await Axios.get(`/event/${event_id}`);
      setEventDetails(event.data);
      console.log("Event Details:", event.data);
      const venue = await Axios.get(`/venue/${event.data.venue.venue_id}`);
      setVenueRows(venue.data.row_count);
      setVenueColumns(venue.data.column_count);
      if (venue.data.row_count === 0 || venue.data.column_count === 0) {
        setIsSeatingPlan(false);
        form.setFieldsValue({ t_count: 1 });
      }
    } catch (error) {
      console.log(error.detail);
    }
  };
  const handleAddToCart = async () => {
    if (selectedSeats.length === 0) {
      message.warning("Please select a seat!");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to add these seats to the cart?",
      content: selectedSeats.map((seat, index) => (
        <>
          <Seat
            number={`${seat.row}-${seat.column}`}
            isActive={true}
            isClicked={true}
            isDisabled={false}
            isOccupied={false}
            disableSelection={true}
          />
          <br />
        </>
      )),
      okText: "Yes",
      okType: "primary",
      cancelText: "No",
      onOk: async () => {
        // Marked this function as async
        let tickets = selectedSeats.map((seat) => ({
          ticket_id: seat.ticketId,
          row_number: seat.row,
          column_number: seat.column,
        }));

        const data = {
          tickets: tickets,
        };

        try {
          await Axios.post(`/buy/add_to_cart/${cartId}`, data);
          window.dispatchEvent(new CustomEvent("addToCart"));
          navigate("/home"); //NAVIGATE TO /shopping_cart LATER
        } catch (error) {
          console.error("Failed to add to cart:", error);
          message.error("Failed to add seats to the cart!");
        }
      },
      onCancel() {
        console.log("Cancel operation was aborted.");
      },
    });
  };

  const handleAddToCartNoSeating = () => {
    Axios.post("/selection/reserve_no_seating_plan", {
      user_id: localStorage.getItem("userId"),
      event_id: event_id,
      category_name: selectedCategory,
      count: form.getFieldValue("t_count"),
      cart_id: cartId,
    })
      .then((response) => {
        const status = response.data.status;
        if (status === "reserved") {
          let tickets = response.data.ticket_ids.map((ticket) => ({
            ticket_id: ticket[0],
            row_number: 0,
            column_number: 0,
          }));
          const data = {
            tickets: tickets,
          };
          console.log("Data:", data);
          Axios.post(`/buy/add_to_cart/${cartId}`, data)
            .then((response) => {
              message.success("Tickets added to cart successfully!");
              navigate("/home"); //NAVIGATE TO /shopping_cart LATER
            })
            .catch((error) => {
              console.error("Failed to add tickets to cart:", error);
              message.error("Failed to add tickets to cart!");
            });
        } else if (status === "exceeded") {
          message.error("Ticket limit exceeded!");
        } else {
          message.error("Failed to reserve tickets!");
        }
      })
      .catch((error) => {
        Axios.post("/selection/unreserve", {
          event_id: event_id,
          user_id: localStorage.getItem("userId"),
          category_name: selectedCategory,
          cart_id: cartId,
        })
          .then((response) => {
            console.log("Unreserved:", response);
          })
          .catch((error) => {
            console.error("Failed to unreserve tickets:", error);
          });
        console.error("Q:", error);
        message.error("Failed to add tickets to cart!");
      });
  };

  return !isLoading ? (
    <>
      <Row className="loc-row" justify={"center"}>
        <Col span={8} className="loc-col">
          {isSeatingPlan ? (
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
          ) : (
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

                <Form.Item
                  label="Enter ticket amount"
                  name="t_count"
                  rules={[
                    {
                      required: true,
                      message: "Please enter ticket amount",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter ticket amount"
                    min={1}
                    max={eventDetails.restriction.max_ticket}
                    defaultValue={1}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" onClick={handleAddToCartNoSeating}>
                    ADD TO CART
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}
        </Col>
        <Col span={16} className="loc-col">
          {isSeatingPlan ? (
            <Card title="Select Seat" className="loc-col-card">
              <SelectionMatrix
                rows={venueRows}
                columns={venueColumns}
                getSeats={getSeats}
                currentSeats={categorySeats}
                flush={flushSeatMatrix}
                cartId={cartId}
              />
              <Divider />
              <Form
                form={buyForm}
                layout="horizontal"
                onFinish={handleAddToCart}
              >
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
          ) : (
            <Card title="Area" className="loc-col-card">
              <img
                src={`${baseURLEvents}${eventDetails.photo_plan}`}
                alt="event"
                style={{
                  width: "60%",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "8px 8px 0 0",
                }}
              />
            </Card>
          )}
        </Col>
      </Row>
    </>
  ) : (
    <>
      <Spin spinning={isLoading} fullscreen />
    </>
  );
}
