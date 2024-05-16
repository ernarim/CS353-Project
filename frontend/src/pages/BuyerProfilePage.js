import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, Input, Button, message, Modal, Form } from 'antd';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import Axios from '../Axios';

const { Title, Text } = Typography;

export const BuyerProfilePage = () => {
    const { user_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
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

        fetchProfile();
    }, [user_id]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!profile) {
        return <div>Loading...</div>;
    }

    const { user, tickets } = profile;

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
            form.resetFields();
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
                    <Button type="primary" onClick={showModal}>
                        Add Balance
                    </Button>
                </div>
                <Divider />
                <div>
                    <Title level={5}>Contact Information</Title>
                    <Text strong>Phone:</Text> <Text>{user.phone || 'N/A'}</Text><br />
                    <Text strong>Balance:</Text> <Text>{user.balance}</Text><br />
                    <Text strong>Birth Date:</Text> <Text>{moment(user.birth_date).format('YYYY-MM-DD')}</Text><br />
                </div>
                <Divider />
                <div>
                    <Title level={5}>Purchased Tickets</Title>
                    {tickets.length === 0 ? (
                        <Text>No tickets purchased.</Text>
                    ) : (
                        tickets.map((ticket, index) => (
                            <Card key={index} style={{ marginBottom: '10px' }}>
                                <Text strong>Event:</Text> <Text>{ticket.event_info.event_name}</Text><br />
                                <Text strong>Date:</Text> <Text>{ticket.event_info.event_date}</Text><br />
                                <Text strong>Venue:</Text> <Text>{ticket.event_info.venue.name}, {ticket.event_info.venue.city}, {ticket.event_info.venue.state}, {ticket.event_info.venue.street}</Text><br />
                                <Text strong>Category:</Text> <Text>{ticket.ticket_info.category_name}</Text><br />
                                <Text strong>Price:</Text> <Text>{ticket.ticket_info.price}</Text><br />
                                <Text strong>Organizer:</Text> <Text>{ticket.event_info.organizer_name}</Text><br />
                                <Text strong>Restrictions:</Text> <Text>{ticket.event_info.restrictions.alcohol ? 'Alcohol allowed' : 'No alcohol'}, {ticket.event_info.restrictions.smoke ? 'Smoking allowed' : 'No smoking'}, Age limit: {ticket.event_info.restrictions.age}, Max tickets: {ticket.event_info.restrictions.max_ticket}</Text><br />
                                <Text strong>Status:</Text> <Text style={{ color: ticket.event_info.is_done || ticket.event_info.is_cancelled ? 'red' : 'green' }}>
                                    {ticket.event_info.is_done ? 'Done' : ticket.event_info.is_cancelled ? 'Cancelled' : 'Upcoming'}
                                </Text><br />
                            </Card>
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
                <Form form={form} onFinish={handleOk}>
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
