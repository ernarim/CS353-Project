import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider } from 'antd';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

export const OrganizerProfilePage = () => {
    const { user_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [showRestrictions, setShowRestrictions] = useState({});
    const [showBuyers, setShowBuyers] = useState({});

    useEffect(() => {
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

        fetchProfile();
    }, [user_id]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }


    const toggleRestrictions = (index) => {
        setShowRestrictions((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const toggleBuyers = (index) => {
        setShowBuyers((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (!profile) {
        return <div>Loading...</div>;
    }

    const { user, reports } = profile;

    return (
        <div style={{ padding: '20px' }}>
            <Card style={{ maxWidth: '600px', margin: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ marginLeft: '20px' }}>
                        <Title level={4}>{user.organizer_name}</Title>
                        <Text type="secondary">{user.email}</Text>
                    </div>
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

                {/* The Reports */}
                <div>
                    <Title level={5}>Reports</Title>
                    {reports.length === 0 ? (
                        <Text>-</Text>
                    ) : (
                        reports.map((report, index) => (
                            <Card key={index} style={{ marginBottom: '10px' }}>
                                <Text strong>Name:</Text> <Text>{report.name}</Text><br />
                                <Text strong>Description:</Text> <Text>{report.description}</Text><br />
                            </Card>
                        ))
                    )}
                </div>
                <Divider />

                {/* The Events */}
                <div>
                    <Title level={5}>Events</Title>
                    {events.length === 0 ? (
                        <Text>No Event organized yet.</Text>
                    ) : (
                        events.map((event, index) => (
                            <Card key={index} style={{ marginBottom: '10px' }}>
                                <Text strong>Name:</Text> <Text>{event.name} / {event.category}</Text><br />
                                <Text strong>Status:</Text> <Text style={{ color: event.is_done || event.is_cancelled ? 'red' : 'green' }}>{event.is_done ? 'Done' : event.is_cancelled ? 'Cancelled' : 'Upcoming'}</Text><br />
                                <Text strong>Date:</Text> <Text>{event.date}</Text><br />
                                <Text strong>Description:</Text> <Text>{event.description}</Text><br />
                                <Text strong>Location:</Text> <Text>{event.venue_name} / (Total capacity= {event.venue_capacity})</Text><br />
                                <Text strong>Status:</Text> <Text style={{ color: event.is_done || event.is_cancelled ? 'red' : 'green' }}>{event.is_done ? 'Done' : event.is_cancelled ? 'Cancelled' : 'Upcoming'}</Text><br />
                                <Text strong>Remaining Seats:</Text> <Text>{event.remaining_seat_no}</Text><br />
                                <Text strong>Return Expire Date:</Text> <Text>{event.return_expire_date}</Text><br />
                                <Text
                                    strong
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleRestrictions(index)}
                                >
                                    <u>Restrictions↓</u>
                                </Text>
                                    {showRestrictions[index] && (
                                        <ul>
                                            <li>Alcohol:<Text style={{ color: event.alcohol ? 'green' : 'red' }}>{event.alcohol ? ' Allowed' : ' Not Allowed'} </Text></li>
                                            <li>Smoke:<Text style={{ color: event.smoke ? 'green' : 'red' }}>{event.smoke ? ' Allowed' : ' Not Allowed'} </Text></li>
                                            <li>Age Limit:<Text>{ event.age}</Text></li>
                                            <li>Max Number of ticket available at each purchase:<Text>{ event.max_ticket}</Text></li>
                                        </ul>
                                    )}
                                <br />
                                <Text
                                    strong
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleBuyers(index)}
                                >
                                    <u>Participants ↓</u>
                                </Text>
                                    {showBuyers[index] && (
                                        <ul>
                                        {event.ticket_buyers.map((buyer, buyerIndex) => (
                                            <li key={buyerIndex}>
                                                <Text>{buyer.name} {buyer.surname} - {buyer.category_name} ({buyer.price})</Text>
                                            </li>
                                        ))}
                                        </ul>
                                    )}
                            </Card>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default OrganizerProfilePage;
