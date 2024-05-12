import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Statistic, Row, Col, Divider } from 'antd';
import { useParams } from 'react-router-dom';
import Axios from "../Axios";
const baseURLEvents = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/events/`;

export function EventInsightPage() {
  const { event_id } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [totalSoldTickets, setTotalSoldTickets] = useState(null);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await Axios.get(`/event/${event_id}`);
        setEventDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch event details', error);
      }
    };

    const fetchTicketCategories = async () => {
      try {
        const response = await Axios.get(`/ticket_category/${event_id}`);
        setTicketCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch ticket categories', error);
      }
    };

    const fetchTotalSoldTickets = async () => { 
      try {
        const response = await Axios.get(`/ticket/${event_id}/total_sold_tickets`);
        setTotalSoldTickets(response.data);
      } catch (error) {
        console.error('Failed to fetch total sold tickets', error);
      }
    };

    fetchEventDetails();
    fetchTicketCategories();
    fetchTotalSoldTickets();
  }, [event_id]);

  if (!eventDetails || ticketCategories.length === 0 || totalSoldTickets === null) {
    return <div>Loading...</div>;
  }

  // Function to handle event update - stubbed out for now.
  const handleUpdateEvent = () => {
    console.log('Update Event Clicked!');
  };

  // Function to handle event cancellation - stubbed out for now.
  const handleCancelEvent = () => {
    console.log('Cancel Event Clicked!');
  };

  // Columns for ticket categories table
  const columns = [
    { title: 'Category', dataIndex: 'category_name', key: 'category_name' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Available', dataIndex: 'available', key: 'available' },
    { title: 'Sold', dataIndex: 'sold', key: 'sold' },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
      {/* Event Image and Details */}
      <Card style={{ width: '60%', margin: '0 20px',boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', justifyContent:'space-around' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={`${baseURLEvents}${eventDetails.photo}`} alt="event" style={{ width: '500px', height: '100%', objectFit: 'contain', borderRadius: '8px 8px 0 0' }} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <h2>{eventDetails.name}</h2>
          <p>{eventDetails.description}</p>
        </div>
      </Card>

      {/* Event Insights */}
        <div style={{ flex: 2, margin: '20px', padding: '20px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h2>Event Insights</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Statistic title="Total Sold Tickets" value={totalSoldTickets} style={{ marginRight: '40px' }} /> {/* Display total sold tickets */}
            <Statistic title="Total Available Seats" value={eventDetails.remaining_seat_no} /> {/* Display total available tickets */}
          </div>
          <Divider style={{ margin: '10px 0px' }}></Divider>
          <Table
            dataSource={ticketCategories}
            columns={columns}
            pagination={false}
            bordered
            size="small"
          />

        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={12}>
            <Button block onClick={handleUpdateEvent}>Update Event</Button>
          </Col>
          <Col span={12}>
            <Button block onClick={handleCancelEvent} danger>Cancel Event</Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}
