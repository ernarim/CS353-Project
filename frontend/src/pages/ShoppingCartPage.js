import React, { useState, useEffect } from 'react';
import Axios from "../Axios";
import { Card, List, Input, Button, Typography, Row, Col, message } from 'antd';

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
      setBalance(user.balance);
      fetchTickets(user.user_id);
    }
  }, []);


  const fetchTickets = async (userId) => {
    try {
      const response = await Axios.get(`/buy/get_tickets?user_id=${userId}`);
      if (response.status === 204) {
        setTickets([]);
      } else {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error.response ? error.response.data : error.message);
    }
  };

  const fetchBalance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setBalance(user.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error.response ? error.response.data : 'No response');
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
      const totalCost = calculateTotal(tickets);
      if (totalCost > balance) {
          message.error("You have insufficient balance for this purchase.");
          return;
      }
      for (const ticket of tickets) {
          console.log("\ntickett", ticket);
          const event_id = ticket.event_id;
          const eventResponse = await Axios.get(`/events/${event_id}`);
          const organizer_id = eventResponse.data.organizer.organizer_id;

          const response = await Axios.post('/buy/transaction', {
              amount: ticket.price,
              buyer_id: userId,
              organizer_id: organizer_id,
          });
          if (response.status !== 200) {
              throw new Error('Failed to complete the transaction');
          }
      }
      message.success('Purchase successful');
      fetchBalance();
    } 
    catch (error) {
      if (error.response && error.response.status === 400) {
          message.error("You have insufficient balance for this purchase.");
      } else {
          message.error('Purchase failed: ' + (error.response ? error.response.data.detail : error.message));
      }
    }
  };

  return (
    <Row style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <Col>
        <Card title="Chosen Ticket(s)" style={{ width: 300, margin:'20px', height:302, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <List
            dataSource={tickets}
            renderItem={item => (
              <List.Item key={item.id}>
                {item.name}: {item.price} TL
              </List.Item>
            )}
          />
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
        <Card title="My Balance" style={{ width: 300, margin:'20px' }}>
          <Text>{balance} TL</Text>
        </Card>
        
        <Card style={{ width: 300, margin:'20px' }}>
          <Text type="secondary">Purchased ticket will be identified to the other party</Text>
          <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: '10px' }} />

          <Button type="primary" style={{ backgroundColor: '#a0d911', borderColor: '#a0d911', color: '#000', marginTop: '10px', width: '100%'}}>
            Buy or Gift
          </Button>
        </Card>
      </Col>
    </Row>
  );
}