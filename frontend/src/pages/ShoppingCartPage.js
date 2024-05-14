import React, { useState, useEffect } from 'react';
import Axios from "../Axios";
import { Card, List, Input, Button, Typography, Row, Col, message, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import '../style/ShoppingCartPage.css';

const { Text } = Typography;

export function ShoppingCartPage() {
  const [tickets, setTickets] = useState([]);
  const [balance, setBalance] = useState(0);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.user_id);
      fetchBalance(user.user_id);
      fetchTickets(user.user_id);
    }
  }, []);

  const fetchTickets = async (userId) => {
    try {
      const response = await Axios.get(`/user/get_tickets/${userId}`);
      if (response.status === 204) {
        setTickets([]);
      } else {
        setTickets(response.data);
        console.log("Fetched Tickets: ", response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error.response ? error.response.data : error.message);
    }
  };

  const fetchBalance = async (userId) => {
    try {
      const response = await Axios.get(`/user/ticket_buyer/${userId}`);
      if (response.status === 200) {
        setBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error.response ? error.response.data : error.message);
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((acc, item) => acc + item.price, 0);
  };

  const handlePurchase = async () => {
    try {
      if (tickets.length === 0) {
        message.error("Your cart is empty. Please add tickets before purchasing.");
        return;
      }
      console.log(tickets);
      const totalCost = calculateTotal(tickets);
      if (totalCost > balance) {
        message.error("You have insufficient balance for this purchase.");
        return;
      }
      const transactions = tickets.map(ticket => ({
        ticket_id: ticket.ticket_id,
        event_id: ticket.event_id,
        organizer_id: ticket.organizer_id,
        buyer_id: userId,
        amount: ticket.price,
      }));

      const response = await Axios.post('/buy/transaction', { transactions });
      if (response.status === 200) {
        message.success('Purchase successful');
        fetchBalance(userId); 
        fetchTickets(userId);
      } else {
        throw new Error('Failed to complete the transaction');
      }
    } 
    catch (error) {
      const errorMessage = error.response ? error.response.data.detail : error.message;
      if (error.response && error.response.status === 400) {
        message.error("You have insufficient balance for this purchase.");
      } else {
        message.error(`Purchase failed: ${errorMessage}`);
      }
    }
  };

  const handleGift = async () => {
    try {
      if (tickets.length === 0) {
        message.error("Your cart is empty. Please add tickets before gifting.");
        return;
      }
      if (!email) {
        message.error("Please enter the recipient's email.");
        return;
      }
      const totalCost = calculateTotal(tickets);
      if (totalCost > balance) {
        message.error("You have insufficient balance for this purchase.");
        return;
      }
      const transactions = tickets.map(ticket => ({
        ticket_id: ticket.ticket_id,
        event_id: ticket.event_id,
        organizer_id: ticket.organizer_id,
        buyer_id: userId,
        amount: ticket.price,
        email: email  // Add the recipient email here
      }));

      const response = await Axios.post('/buy/transaction', { transactions });
      if (response.status === 200) {
        message.success('Tickets gifted successfully');
        fetchBalance(userId); 
        fetchTickets(userId);
      } else {
        throw new Error('Failed to complete the transaction');
      }
    } 
    catch (error) {
      const errorMessage = error.response ? error.response.data.detail : error.message;
      if (error.response && error.response.status === 400) {
        message.error("You have insufficient balance for this purchase.");
      } else {
        message.error(`Gifting failed: ${errorMessage}`);
      }
    }
  };

  const handleDelete = async (ticketId) => {
    try {
      const response = await Axios.delete(`/buy/delete_from_cart/${ticketId}`);
      if (response.status === 200) {
        message.success('Ticket removed from cart');
        fetchTickets(userId);
      } else {
        throw new Error('Failed to remove ticket from cart');
      }
    } catch (error) {
      message.error('Failed to remove ticket: ' + (error.response ? error.response.data.detail : error.message));
    }
  };

  return (
    <Row style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <Col>
        <Card title="Chosen Ticket(s)" style={{ width: 450, margin: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="scrollable">
            <List
              dataSource={tickets}
              renderItem={(item, index) => (
                <>
                  <List.Item key={item.ticket_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Text strong>{item.name}</Text>
                      <Text strong>{new Date(item.date).toLocaleString()}</Text>
                      <Text>Category: {item.category_name}, Seat: {item.row_number}-{item.column_number}</Text>
                      <Text>Price: {item.price} TL</Text>
                    </div>
                    <DeleteOutlined onClick={() => handleDelete(item.ticket_id)} style={{ color: 'red', fontSize: '20px', cursor: 'pointer' }} />
                  </List.Item>
                  {index < tickets.length - 1 && <Divider className="divider" />}
                </>
              )}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <Text strong>Total</Text>
            <Text strong>{calculateTotal(tickets)} TL</Text>
          </div>
          <Button type="primary" onClick={handlePurchase} style={{ width: '100%', marginTop: '10px' }}>
            Buy
          </Button>
        </Card>
      </Col>
      <Col>
        <Card title="My Balance" style={{ width: 300, margin: '20px' }}>
          <Text>{balance} TL</Text>
        </Card>
        
        <Card style={{ width: 300, margin: '20px' }}>
          <Text type="secondary">Purchased ticket will be identified to the other party</Text>
          <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: '10px' }} />

          <Button type="primary" onClick={handleGift} style={{ backgroundColor: '#a0d911', borderColor: '#a0d911', color: '#000', marginTop: '10px', width: '100%' }}>
            Gift
          </Button>
        </Card>
      </Col>
    </Row>
  );
}