import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Statistic, Row, Col, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, notification } from 'antd';
import Axios from "../Axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const baseURLEvents = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/events/`;

export function EventInsightPage() {
  const { event_id } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [totalSoldTickets, setTotalSoldTickets] = useState(null);
  const [eventCancelled, setEventCancelled] = useState(false);
  const [ageDistribution, setAgeDistribution] = useState([]);

  const navigate = useNavigate();

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
        const [soldResponse, availableResponse] = await Promise.all([
          Axios.get(`/event/${event_id}/sold_tickets_by_category`),
          Axios.get(`/event/${event_id}/available_tickets_by_category`)
        ]);

        const soldTickets = soldResponse.data.sold_tickets_by_category;
        const availableTickets = availableResponse.data.available_tickets_by_category;

        const combinedData = availableTickets.map(available => {
          const sold = soldTickets.find(s => s.category_name === available.category_name);
          return {
            category_name: available.category_name,
            price: available.price,
            available: available.available_tickets,
            sold: sold ? sold.sold_tickets : 0
          };
        });

        setTicketCategories(combinedData);
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

const fetchAgeDistribution = async () => {
  try {
    const response = await Axios.get(`/event/${event_id}/buyer_age_distribution`);
    const data = response.data.buyer_age_distribution; 
    if (Array.isArray(data)) {
      setAgeDistribution(data);
    } else {
      console.error('Age Distribution data is not an array:', data);
    }
  } catch (error) {
    console.error('Failed to fetch age distribution', error);
  }
};

    fetchEventDetails();
    fetchTicketCategories();
    fetchTotalSoldTickets();
    fetchAgeDistribution();
  }, [event_id]);

  if (!eventDetails || ticketCategories.length === 0 || totalSoldTickets === null) {
    return <div>Loading...</div>;
  }

  const handleUpdateEvent = () => {
    console.log('Update Event Clicked!');
    navigate(`/update_event/${event_id}`);
  };

  const handleCancelEvent = () => {
    Modal.confirm({
      title: `Are you sure you want to cancel the "${eventDetails.name}" event?`,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        cancelEvent();
      },
      onCancel() {
        console.log('Cancel operation was aborted.');
      },
    });
  };

  const cancelEvent = async () => {
    try {
      const response = await Axios.post(`/event/cancel/${event_id}`);
      console.log('Event cancelled successfully:', response.data);
      notification.success({
        message: 'Event Cancelled',
        description: response.data.message,
        duration: 5
      });
      setEventCancelled(true);
    } catch (error) {
      console.error('Failed to cancel the event:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to cancel the event. Please try again later.',
        duration: 5
      });
    }
  };

  const columns = [
    { title: 'Category', dataIndex: 'category_name', key: 'category_name' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Available', dataIndex: 'available', key: 'available' },
    { title: 'Sold', dataIndex: 'sold', key: 'sold' },
  ];

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: '20px' }}>
        <Card style={{ width: '60%', margin: '0 20px', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={`${baseURLEvents}${eventDetails.photo}`} alt="event" style={{ width: '500px', height: '100%', objectFit: 'contain', borderRadius: '8px 8px 0 0' }} />
          </div>
          <div style={{ marginTop: '20px', flex: 1 }}>
            <h2>{eventDetails.name}</h2>
            <p>{eventDetails.description}</p>
          </div>
        </Card>

        <div style={{ flex: 2, margin: '20px', padding: '20px', borderRadius: '8px', backgroundColor: 'white' }}>
          <h2>Event Insights</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Statistic title="Total Sold Tickets" value={totalSoldTickets} style={{ marginRight: '40px' }} />
            <Statistic title="Total Available Seats" value={eventDetails.remaining_seat_no} />
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
              <Button block onClick={handleUpdateEvent} disabled={eventDetails.is_cancelled || eventCancelled}>
                Update Event
              </Button>
            </Col>
            <Col span={12}>
              <Button block onClick={handleCancelEvent} danger disabled={eventDetails.is_cancelled || eventCancelled}>
                Cancel Event
              </Button>
            </Col>
          </Row>
        </div>
      </div>
      <div style={{ width: '60%', margin: '20px', padding: '20px', borderRadius: '8px', backgroundColor: 'white', paddingLeft: '30px'}}>
        <h2>Age Distribution of Ticket Buyers</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={ageDistribution}
              dataKey="count"
              nameKey="age_range"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {ageDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
