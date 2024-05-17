import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, Select, Input, Button, message, Modal, Form } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from '../Axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

export const BuyerProfilePage = () => {
    const navigate = useNavigate();
    const { user_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [filter, setFilter] = useState('All');

    const fetchProfile = async () => {
        try {
            const response = await Axios.get(`/buyer_profile/${user_id}`);
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

    const handleLogout = () => {
        message.success('Logged out successfully!');
        navigate('/login');
    };

    const handleReturnTicket = async (e, ticket_id, user_id) => {
        e.stopPropagation(); 
        try {
            const response = await Axios.get(`/return_ticket/${ticket_id}`);
            alert('Ticket returned successfully');
            fetchProfile();
        } catch (error) {
            console.error('Error returning ticket:', error.response?.data?.detail || 'Unknown error');
            alert('Failed to return ticket');
        }
    };

    const handleTicketClick = (event_id) => {
        navigate(`/event_detail/${event_id}`);
    };


    if (error) {
        return <div>Error: {error.message}</div>;
    }
    
    
    if (!profile) {
        return <div>Loading...</div>;
    }

    const { user, tickets } = profile;

    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'All') return true;
        if (filter === 'Upcoming' && !ticket.event_info.is_done && !ticket.event_info.is_cancelled) return true;
        if (filter === 'Passed' && ticket.event_info.is_done) return true;
        if (filter === 'Cancelled' && ticket.event_info.is_cancelled) return true;
        return false;
    });

    const handleFilterChange = (value) => {
        setFilter(value);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = async (values) => {
        try {
            const response = await Axios.post('/user/add_balance', {
                user_id: user_id,
                password: values.password,
                amount: parseFloat(values.amount),
            });
            message.success(response.data.message);
            setProfile((prevProfile) => ({
                ...prevProfile,
                user: { ...prevProfile.user, balance: response.data.new_balance },
            }));
        } catch (error) {
            const errorMessage = error.response ? error.response.data.detail : error.message;
            message.error(`Failed to add balance: ${errorMessage}`);
        } finally {
            setIsModalVisible(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Card style={{ maxWidth: '600px', margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ marginLeft: '20px' }}>
                            <Title level={4}>{user.name} {user.surname}</Title>
                            <Text type="secondary">{user.email}</Text>
                        </div>
                    </div>
                    <Button type="primary" danger onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
                <Divider />
                <div>
                    <Title level={5}>Contact Information</Title>
                    <Text strong>Phone:</Text> <Text>{user.phone || 'N/A'}</Text><br />
                    <Text strong>Balance:</Text> <Text>{user.balance}</Text><br /> 
                    <Text strong>Birth Date:</Text> <Text>{moment(user.birth_date).format('DD/MM/YYYY')}</Text><br />
                </div>
                <Divider />
                <Button type="primary" onClick={showModal}>
                        Add Balance
                    </Button>
                <Divider />
                <div>
                    <Title level={5}>Purchased Tickets</Title>
                    <Select defaultValue="All" style={{ width: 120, marginBottom: '10px' }} onChange={handleFilterChange}>
                        <Option value="All">All</Option>
                        <Option value="Upcoming">Upcoming</Option>
                        <Option value="Passed">Passed</Option>
                        <Option value="Cancelled">Cancelled</Option>
                    </Select>
                    <br />
                    {filteredTickets.length === 0 ? (
                        <Text>No tickets matching this filter.</Text>
                    ) : (
                        filteredTickets.map((ticket, index) => (
                            <div key={index} style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => handleTicketClick(ticket.event_info.event_id)}>
                                <Card>
                                    <Text strong>Ticket ID:</Text> <Text>{ticket.ticket_info.ticket_id}</Text><br />
                                    <Text strong>Event:</Text> <Text>{ticket.event_info.event_name} / {ticket.ticket_info.category_name}</Text><br />
                                    <Text strong>Status:</Text> <Text style={{ color: ticket.event_info.is_done || ticket.event_info.is_cancelled ? 'red' : 'green' }}>
                                        {ticket.event_info.is_done ? 'Passed' : ticket.event_info.is_cancelled ? 'Cancelled' : 'Upcoming'}
                                    </Text><br />
                                    <Text strong>Date:</Text> <Text>{moment(ticket.event_info.date).format('DD/MM/YYYY HH:mm')}</Text><br />
                                    {moment().isBefore(moment(ticket.event_info.return_expire_date)) && (
                                        <Button onClick={(e) => handleReturnTicket(e, ticket.ticket_info.ticket_id, user.user_id)}>Return Ticket</Button>
                                    )}
                                </Card>
                            </div>
                        ))
                    )}
                </div>

                
            </Card>

            <Modal
                title="Add Balance"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form onFinish={handleOk}>
                    <Form.Item
                        name="amount"
                        rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                        <Input placeholder="Amount" type="number" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please enter password' }]}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Add Balance
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BuyerProfilePage;
