import React, { useEffect, useState } from 'react';
import { Card, List, Button } from 'antd';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Axios from "../Axios";
import moment from 'moment';
const baseURLEvents = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/events/`;

export function EventDetailPage() {
  const navigate = useNavigate();
  const { event_id } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("help");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await Axios.get(`/event/${event_id}`);
        console.log(response.data);
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
        setTicketCategories([]);
      }
    };


    const fetchData = async () => {
      await fetchEventDetails();
      await fetchTicketCategories();
      setLoading(false);

    };

    fetchData(); 
  }, [event_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', padding: '20px', justifyContent: 'space-between', position: 'relative' }}>
      {/* Event Image and Details */}
      <Card style={{ width: '60%', margin: '0 20px', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={`${baseURLEvents}${eventDetails.photo}`} alt="event" style={{ width: '500px', height: '100%', objectFit: 'contain', borderRadius: '8px 8px 0 0' }} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <h2>{eventDetails.name}</h2>
          <p>{eventDetails.description}</p>
        </div>
      </Card>
  
      {/* Organizer, Venue, and Tickets */}
      <div style={{ flex: '1', margin: '0 20px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: '80vh' }}>
        <h3>Organizer</h3>
        <p>{eventDetails.organizer.organizer_name}</p>
        <h3>Venue</h3>
        <p>{`${eventDetails.venue.name}, ${eventDetails.venue.city}`}</p>
  
        {/* Restrictions */}
        <div>
          <h3 style={{ marginBottom: '5px' }}>Restrictions</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '50px' }}>
              <p style={{ marginBottom: '5px' }}>•Alcohol: {eventDetails.restriction.alcohol ? 'Allowed' : 'Not Allowed'}</p>
              <p style={{ marginBottom: '5px' }}>•Smoke: {eventDetails.restriction.smoke ? 'Allowed' : 'Not Allowed'}</p>
            </div>
            <div>
              <p style={{ marginBottom: '5px' }}>•Minimum Age: {eventDetails.restriction.age}</p>
              <p style={{ marginBottom: '5px' }}>•Max Tickets: {eventDetails.restriction.max_ticket}</p>
            </div>
          </div>
        </div>
        <h3 style={{ marginBottom: '5px' }}>Date and Time</h3>
        <p>{moment(eventDetails.date).format('MMMM Do YYYY, h:mm:ss a')}</p>
  
        <h3 style={{ marginBottom: '5px' }}>Category</h3>
        <p>{eventDetails.category.category_name}</p>
  
        <h3 style={{ marginBottom: '5px' }}>Ticket Categories</h3>
        <List
          itemLayout="horizontal"
          dataSource={ticketCategories}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={`${item.category_name}`}
                description={`price: ${item.price}`}
              />
            </List.Item>
          )}
        />
        <Button type="primary" style={{ width: '100%', marginTop: '10px' }} onClick={() => navigate(`/select_ticket/${event_id}`)}>
          Choose Ticket
        </Button>
      </div>
    </div>
  );
  
}