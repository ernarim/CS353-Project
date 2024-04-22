import React from 'react';
import { Card, Avatar, Typography, Divider } from 'antd';

const { Title, Text } = Typography;

export const BuyerProfilePage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ maxWidth: '600px', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Avatar size={64} src="buyer_avatar.jpg" />
          <div style={{ marginLeft: '20px' }}>
            <Title level={4}>John Doe</Title>
            <Text type="secondary">john.doe@example.com</Text>
          </div>
        </div>
        <Divider />
        <div>
          <Title level={5}>Contact Information</Title>
          <Text strong>Phone:</Text> <Text>+1 (123) 456-7890</Text><br />
          <Text strong>Address:</Text> <Text>123 Main St, City, Country</Text>
        </div>
        <Divider />
        <div>
          <Title level={5}>Order History</Title>
          {/* Example order history items */}
          <div>
            <Text strong>Order ID:</Text> <Text>1234567890</Text><br />
            <Text strong>Date:</Text> <Text>2024-04-22</Text><br />
            <Text strong>Total:</Text> <Text>$150.00</Text>
          </div>
          <div>
            <Text strong>Order ID:</Text> <Text>0987654321</Text><br />
            <Text strong>Date:</Text> <Text>2024-04-20</Text><br />
            <Text strong>Total:</Text> <Text>$80.00</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

