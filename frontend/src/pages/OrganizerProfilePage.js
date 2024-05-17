import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, Button, Row, Col } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/org_profile.css';

const { Title, Text } = Typography;

export const OrganizerProfilePage = () => {
    const navigate = useNavigate();
    const { user_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    
    const fetchProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/org_profile/${user_id}`);
            console.log('Profile data:', response.data); // Debugging statement
            setProfile(response.data);
        } catch (err) {
            console.error('Error fetching profile:', err); // Debugging statement
            setError(err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user_id]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const handleLogout = () => {
        navigate('/login');
    };

    const handleEventClick = (event_id) => {
        navigate(`/event_insight/${event_id}`);
    };

    if (!profile) {
        return <div>Loading...</div>;
    }

    const { user, reports , events, venues } = profile;
    const pendingVenues = venues.filter(venue => venue.status === "pending");
    const verifiedVenues = venues.filter(venue => venue.status === "verified");
    return (
        <div className="profile-container">
            <Card style={{minWidth: '700px', maxWidth: '700px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <Title level={4}>{user.organizer_name}</Title>
                        <Text type="secondary">{user.email}</Text>
                    </div>
                    <Button type="primary" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
                <Divider />

                {/* Contact Information */}
                <div>
                    <Title level={5}>Contact Information</Title>
                    <Text strong>Phone:</Text> <Text>{user.phone || '-'}</Text><br />
                    <Text strong>Last Login:</Text> <Text>{user.last_login || '-'}</Text><br />
                    <Text strong>Balance:</Text> <Text>{user.balance}</Text><br />
                </div>
                <Divider />

                {/* The Events */}
                <div>
                    <Title level={4}>Events</Title>
                    {events.length === 0 ? (
                        <Text>No Event organized yet.</Text>
                    ) : (
                        events.map((event, index) => (
                            <div key={index} style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => handleEventClick(event.event_id)}>
                                <Card>
                                    <Text strong>Event:</Text> <Text>{event.name}</Text><br />
                                    <Text strong>Status:</Text> <Text style={{ color: event.is_done || event.is_cancelled ? 'red' : 'green' }}>
                                    {event.is_done ? 'Passed' : event.is_cancelled ? 'Cancelled' : 'Upcoming'}
                                    </Text><Text> / {event.date}</Text><br />
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            </Card>


            {/* Location Request */}
            <Card style={{ minWidth: '700px',maxWidth: '700px'}}>
                <div> 
                    <Title level={4}>Location Requests</Title>
                    <div>
                        <Title level={5} style={{ color: 'red' }}>Pending Venue Requests</Title>
                        {
                        pendingVenues.length === 0 ? (
                            <Text>No Pending Requests</Text>
                        ) : ( 
                            pendingVenues.map((venue, index) => (
                                <Card key={index} style={{ marginBottom: '10px' }}>
                                    <Text strong>Venue Name: </Text> <Text>{venue.name}</Text><br />
                                    <Text strong>Address: </Text> <Text>{venue.street}, {venue.city}, {venue.state}</Text><br />
                                    <Text strong>Capacity: </Text> <Text>{venue.capacity}</Text><br />
                                </Card>
                            ))
                        )}
                    </div>
                    {/* Verified Requests */}
                    <div style={{ marginTop: '20px' }}> {/* Added margin for visual separation */}
                        <Title level={5} style={{ color: 'green' }}>Verified Venues</Title>
                        {verifiedVenues.length === 0 ? (
                            <Text>No Verified Venue</Text>
                        ) : (
                            verifiedVenues.map((venue, index) => (
                                <Card key={index} style={{ marginBottom: '10px' }}>
                                    <Text strong>Venue Name: </Text> <Text>{venue.name}</Text><br />
                                    <Text strong>Address: </Text> <Text>{venue.street}, {venue.city} / {venue.state}</Text><br />
                                    <Text strong>Capacity: </Text> <Text>{venue.capacity}</Text><br />
                                </Card>
                            ))
                        )}
                    </div>
                </div>
                <Divider />




                {/* The Reports */}
                <div>
                    <Title level={4}>Reports</Title>
                    {reports.length === 0 ? (
                        <Text>No Reports were available!</Text>
                    ) : (
                        reports.map((report, index) => (
                            <Card key={index} style={{ marginBottom: '10px' }}>
                                <Text strong>Report:</Text> <Text>{report.report_id}</Text><br />
                                <Text strong>Date:</Text> <Text>{report.date}</Text><br />
                                <Text strong>Sold Tickets:</Text> <Text>{report.sold_tickets}</Text><br />
                                <Text strong>Unsold Tickets:</Text> <Text>{report.unsold_tickets}</Text><br />
                                <Text strong>Total Revenue:</Text> <Text>{report.total_revenue}</Text><br />
                                <Text strong>Total Events:</Text> <Text>{report.total_events}</Text><br />
                                <Text strong>Balance:</Text> <Text>{report.balance}</Text><br />
                            </Card>
                        ))
                    )}
                </div> 
            </Card>
        </div>
    );
}

export default OrganizerProfilePage;