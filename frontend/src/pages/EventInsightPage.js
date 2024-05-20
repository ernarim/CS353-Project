import React, { useState, useEffect } from "react";
import { Card, Button, Table, Statistic, Row, Col, Divider, Modal, notification , Collapse} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../Axios";
import moment from "moment";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell as BarCell, LabelList } from "recharts";
import SelectionMatrix from "../components/SelectionMatrix";
const { Panel } = Collapse;

const baseURLEvents = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/events/`;

export function EventInsightPage() {
  const { event_id } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [totalSoldTickets, setTotalSoldTickets] = useState(null);
  const [totalAvailableTickets, setTotalAvailableTickets] = useState(null);
  const [eventCancelled, setEventCancelled] = useState(false);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [categorySeats, setCategorySeats] = useState([]);
  const [venueRows, setVenueRows] = useState(0);
  const [venueColumns, setVenueColumns] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, [event_id]);

  const fetchAll = async () => {
    if (event_id) {
      fetchEventDetails();
      fetchTicketCategories();
      fetchTotalSoldTickets();
      fetchTotalAvailableTickets();
      fetchAgeDistribution();
      fetchEventSeats();
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await Axios.get(`/event/${event_id}`);
      setEventDetails({
        ...response.data,
        isPast: moment().isAfter(moment(response.data.date)) // Check if current time is after the event date
      });
      fetchVenue(response.data.venue.venue_id);
      console.log("Event Details", response.data);
    } catch (error) {
      console.error("Failed to fetch event details", error);
    }
  };

  const fetchTicketCategories = async () => {
    try {
      const [soldResponse, availableResponse] = await Promise.all([
        Axios.get(`/event/${event_id}/sold_tickets_by_category`),
        Axios.get(`/event/${event_id}/available_tickets_by_category`),
      ]);

      const soldTickets = soldResponse.data.sold_tickets_by_category || [];
      const availableTickets = availableResponse.data.available_tickets_by_category || [];

      const combinedData = availableTickets.map((available) => {
        const sold = soldTickets.find((s) => s.category_name === available.category_name);
        return {
          category_name: available.category_name,
          price: available.price,
          available: available.available_tickets,
          sold: sold ? sold.sold_tickets : 0,
        };
      });
      console.log("Ticket Categories", combinedData);

      setTicketCategories(combinedData);
    } catch (error) {
      console.error("Failed to fetch ticket categories", error);
    }
  };

  const fetchTotalSoldTickets = async () => {
    try {
      const response = await Axios.get(`/ticket/${event_id}/total_sold_tickets`);
      setTotalSoldTickets(response.data || 0);
      console.log("Total Sold Tickets", response.data);
    } catch (error) {
      console.error("Failed to fetch total sold tickets", error);
    }
  };

  const fetchTotalAvailableTickets = async () => {
    try {
      const response = await Axios.get(`/ticket/${event_id}/total_available_tickets`);
      setTotalAvailableTickets(response.data || 0);
      console.log("Total Available Tickets", response.data);
    } catch (error) {
      console.error("Failed to fetch total available tickets", error);
    }
  };

  const fetchAgeDistribution = async () => {
    try {
      const response = await Axios.get(`/event/${event_id}/buyer_age_distribution`);
      const data = response.data.buyer_age_distribution || [];
      setAgeDistribution(data);
      console.log("Age Distribution", data);
    } catch (error) {
      console.error("Failed to fetch age distribution", error);
    }
  };

  const fetchEventSeats = async () => {
    try {
      const response = await Axios.get(`/event/${event_id}/seating_plan`);
      let newSeats = [];
      for (let i = 0; i < response.data.length; i++) {
        newSeats.push([]);
        for (let j = 0; j < response.data[i].length; j++) {
          let seat = response.data[i][j];
          seat.show = true;
          newSeats[i].push(seat);
        }
      }
      console.log("Event Seats", newSeats);
      setCategorySeats(newSeats);
    } catch (error) {
      console.error("Failed to fetch event seats", error);
    }
  };

  const fetchVenue = async (venue_id) => {
    try {
      const response = await Axios.get(`/venue/${venue_id}`);
      console.log("Venue Details", response.data);
      setVenueRows(response.data.row_count);
      setVenueColumns(response.data.column_count);
    } catch (error) {
      console.error("Failed to fetch venue details", error);
    }
  };

  const handleUpdateEvent = () => {
    navigate(`/update_event/${event_id}`);
  };

  const handleCancelEvent = () => {
    Modal.confirm({
      title: `Are you sure you want to cancel the "${eventDetails.name}" event?`,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        cancelEvent();
      },
    });
  };

  const cancelEvent = async () => {
    try {
      const response = await Axios.post(`/event/cancel/${event_id}`);
      notification.success({
        message: "Event Cancelled",
        description: response.data.message,
        duration: 5,
      });
      setEventCancelled(true);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to cancel the event. Please try again later.",
        duration: 5,
      });
    }
  };

  const columns = [
    { title: "Category", dataIndex: "category_name", key: "category_name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Available", dataIndex: "available", key: "available" },
    { title: "Sold", dataIndex: "sold", key: "sold" },
  ];

  const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"];

  const calculateTotalRevenue = () => {
    return ticketCategories.map(category => ({
      category_name: category.category_name,
      total_revenue: category.price * category.sold,
    }));
  };

  const totalRevenueData = calculateTotalRevenue();

  return (
    <div>
      {eventDetails  && ticketCategories.length && totalAvailableTickets !== null  ? (
        <div style={{ padding: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Card
                style={{
                  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: "20px",
                  }}
                >
                  <img
                    src={`${baseURLEvents}${eventDetails.photo}`}
                    alt="event"
                    style={{
                      width: "60%",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: "8px 8px 0 0",
                    }}
                  />
                </div>
                <div style={{ padding: "20px" }}>
                  <h2>{eventDetails.name}</h2>
                  <p>{eventDetails.description}</p>
                </div>
              </Card>
              <Card
                style={{
                  marginTop: "16px",
                  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                }}
                bodyStyle={{ padding: "0px", backgroundColor:'white', borderRadius: "10px"}}
              >
                
                <Collapse>
                  <Panel header="Seating Plan" key="1" style={{backgroundColor:'white'}}>
                    { venueRows  && venueColumns ?
                    
                    <div style={{ overflowX: "auto", display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                      <SelectionMatrix
                        rows={venueRows}
                        columns={venueColumns}
                        currentSeats={categorySeats}
                        getSeats={() => {}}
                        disableSelection={true}
                        header={[true, true, false, false]}
                      />
                    </div> :

                    
                    <div style={{ padding: "20px" }}>
                    {eventDetails.photo_plan  && (
                      <img
                        src={ `${baseURLEvents}${eventDetails.photo_plan}`}
                        alt="event"
                        style={{
                          width: "60%",
                          height: "auto",
                          objectFit: "contain",
                          borderRadius: "8px 8px 0 0",
                        }}
                      />
                    )}
                    </div>
                  }
                  </Panel>
                </Collapse>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                style={{
                  padding: "20px",
                  borderRadius: "8px",
                  backgroundColor: "white",
                }}
              >
                <h2>Event Insights</h2>

                <h4 style={{ marginBottom: "5px" }}>Venue</h4>
                <p>{`${eventDetails.venue.name}, ${eventDetails.venue.city}`}</p>

                <h4 style={{ marginBottom: "5px" }}>Date and Time</h4>
                <p>
                  {moment(eventDetails.date).format("MMMM Do YYYY, h:mm:ss a")}
                  {(eventDetails.isPast )&& <span style={{ color: "red", marginLeft: "10px" }}>PASSED</span>}
                  {(eventDetails.is_cancelled )&& <span style={{ color: "red", marginLeft: "10px" }}>CANCELED</span>}
                </p>

                <h4 style={{ marginBottom: "5px" }}>Category</h4>
                <p>{eventDetails.category.category_name}</p>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <Statistic
                    title="Total Sold Tickets"
                    value={totalSoldTickets}
                    style={{ marginRight: "40px" }}
                  />
                  <Statistic
                    title="Total Available Seats"
                    value={totalAvailableTickets}
                    style={{ marginRight: "40px" }}
                  />
                </div>
                <Divider style={{ margin: "10px 0px" }}></Divider>
                <Table
                  dataSource={ticketCategories}
                  columns={columns}
                  pagination={false}
                  bordered
                  size="small"
                />

                <div style={{ marginTop: "20px" }}>
                  <h2>Age Distribution of Ticket Buyers</h2>
                  <ResponsiveContainer width="100%" height={230}>
                    {ageDistribution && (
                      <PieChart>
                        <Pie
                          data={ageDistribution}
                          dataKey="count"
                          nameKey="age_group"
                          cx="50%"
                          cy="50%"
                          outerRadius={86}
                          fill="#8884d8"
                          label
                        >
                          {ageDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    )}
                  </ResponsiveContainer>

                <div style={{ marginTop: "20px" }}>
                  <h2> Total Revenue by Ticket Category</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={totalRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category_name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_revenue">
                      {totalRevenueData.map((entry, index) => (
                        <BarCell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                      <LabelList dataKey="total_revenue" position="top" />
                    </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                </div>
                <Row gutter={16} style={{ marginTop: "20px" }}>
                  <Col span={12}>
                    <Button
                      block
                      onClick={handleUpdateEvent}
                      disabled={eventDetails.is_cancelled || eventCancelled || eventDetails.isPast}
                    >
                      Update Event
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      block
                      onClick={handleCancelEvent}
                      danger
                      disabled={eventDetails.is_cancelled || eventCancelled || eventDetails.isPast}
                    >
                      Cancel Event
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
