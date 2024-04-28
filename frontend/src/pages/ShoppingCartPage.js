import React from 'react';
import { Card, List, Input, Button, Typography, Row,Col } from 'antd';

const { Text } = Typography;

// Dummy data for the chosen tickets. Replace it with your actual state/data management logic.
const tickets = [
  { id: 1, name: 'Concert A - Front Row', price: 300 },
  { id: 2, name: 'Concert B - VIP', price: 700 },
  // ... other tickets
];

export function ShoppingCartPage() {
  const calculateTotal = (items) => {
    return items.reduce((acc, item) => acc + item.price, 0);
  };

  const total = calculateTotal(tickets);

  return (
    <Row  style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
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
                <Text strong>{total} TL</Text>
                </div>
                <Button type="primary" style={{ width: '100%', marginTop: '10px' }}>
                    Buy
                </Button>

            </Card>

            
        </Col>
        <Col>
            <Card title="My Balance" style={{ width: 300, margin:'20px'  }}>
            {/* Balance information goes here */}
            </Card>
            
            <Card style={{ width: 300, margin:'20px'  }}>
            <Text type="secondary">Purchased ticket will be identified to the other party</Text>
                <Input placeholder="email" style={{ marginBottom: '10px' }} />

                <Button type="primary" style={{ backgroundColor: '#a0d911', borderColor: '#a0d911', color: '#000', marginTop: '10px', width: '100%'}}>
                     Buy or Gift
                </Button>

            </Card>
        </Col>
    


      
    </Row>
  );
}
