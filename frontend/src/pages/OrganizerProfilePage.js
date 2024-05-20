import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, Button, Select, message, Modal  } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from '../Axios';
import '../style/org_profile.css';
import moment from 'moment';
import { AdminReportPage } from './AdminReportPage';

const { Title, Text } = Typography;
const { Option } = Select;

export const OrganizerProfilePage = () => {
    const navigate = useNavigate();
    const { user_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);


    
    const fetchProfile = async () => {
        try {
            const response = await Axios.get(`/org_profile/${user_id}`);
            console.log('Profile data:', response.data);
            setProfile(response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
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
        message.success('Logged out successfully!');
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


    const filteredEvents = events.filter(event => {
        if (filter === 'All') return true;
        if (filter === 'Upcoming' && !event.is_done && !event.is_cancelled) return true;
        if (filter === 'Passed' && event.is_done) return true;
        if (filter === 'Cancelled' && event.is_cancelled) return true;
        return false;
    });

    const handleFilterChange = (value) => {
        setFilter(value);
    };

    const handleShowReport = (record) => {
        console.log("Showing report: ", record);
        setSelectedReport(record);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedReport(null);
    };

    return (
        <div className="profile-container" style={{display:'flex', flexDirection:'row', justifyContent:'center', gap:'2%'}}>
            

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
                    <div style={{ marginTop: '20px' }}>
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
                            <Card key={index} style={{ marginBottom: '10px' }} onClick={() => handleShowReport(report)}
                            >
                                <Text strong>Report:</Text> <Text>{report.report_id}</Text><br />
                                <Text strong>Date:</Text> <Text>{moment(report.date).format('DD/MM/YYYY')}</Text><br />
                                
                            </Card>
                        ))
                    )}
                </div> 
            </Card>

            <Card style={{minWidth: '700px', maxWidth: '700px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <Title level={4}>{user.organizer_name}</Title>
                        <Text type="secondary">{user.email}</Text>
                    </div>
                    <Button type="primary" danger onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
                <Divider />

                {/* Contact Information */}
                <div>
                    <Title level={5}>Contact Information</Title>
                    <Text strong>Phone:</Text> <Text>{user.phone || '-'}</Text><br />
                    <Text strong>Balance:</Text> <Text>{user.balance}</Text><br />
                </div>
                <Divider />

                {/* The Events */}
                <div>
                    <Title level={4}>Events</Title>
                    <Select defaultValue="All" style={{ width: 120, marginBottom: '10px' }} onChange={handleFilterChange}>
                        <Option value="All">All</Option>
                        <Option value="Upcoming">Upcoming</Option>
                        <Option value="Passed">Passed</Option>
                        <Option value="Cancelled">Cancelled</Option>
                    </Select>
                    <br />
                    {filteredEvents.length === 0 ? (
                        <Text>No events matching this filter.</Text>
                    ) : (
                        filteredEvents.map((event, index) => (
                            <div key={index} style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => handleEventClick(event.event_id)}>
                                <Card>
                                    <Text strong>Event: </Text> <Text>{event.name}</Text><br />
                                    <Text strong>Status: </Text> 
                                    <Text style={{ color: moment().isAfter(moment(event.date)) ? 'red' : event.is_cancelled ? 'red' : 'green' }}>
                                        {moment().isAfter(moment(event.date)) ? 'Passed' : event.is_cancelled ? 'Cancelled' : 'Upcoming'}
                                    </Text>
                                    <Text> / {moment(event.date).format('DD/MM/YYYY HH:mm')}</Text><br />
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <Modal width={1700}  visible={isModalVisible} onCancel={handleModalClose} footer={null} centered>
            <AdminReportPage propOrganizerStats={selectedReport?.organizer_statistics} 
                        propParticipantStats={selectedReport?.participant_statistics} 
                        propAgeStats={selectedReport?.age_statistics}
                        propRevenueStats={selectedReport?.revenue_statistics}>

                        </AdminReportPage>
            
            </Modal>
        </div>
    );
}

export default OrganizerProfilePage;