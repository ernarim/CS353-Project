import React from 'react';
import { Card, Button, Table, Statistic, Row, Col, Divider } from 'antd';

export function EventInsightPage () {
  // Example data for ticket sales. This would come from your event management state or props.
  const ticketSales = {
    totalSold: 27,
    totalAvailable: 156,
    ticketCategories: [
      { category: 'A', sold: 10, available: 50 },
      { category: 'B', sold: 17, available: 79 },
      // ... add other ticket categories here
    ],
  };

  const columns = [
    {
      title: 'catg.',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Sold',
      dataIndex: 'sold',
      key: 'sold',
    },
    {
      title: 'Available',
      dataIndex: 'available',
      key: 'available',
    },
  ];

  // Function to handle event update - stubbed out for now.
  const handleUpdateEvent = () => {
    console.log('Update Event Clicked!');
  };

  // Function to handle event cancellation - stubbed out for now.
  const handleCancelEvent = () => {
    console.log('Cancel Event Clicked!');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
      {/* Event Image and Details */}
      <div style={{ flex: 3, margin: '20px' }}>
        <Card
          cover={<div style={{ height: '200px', background: 'rgba(0,0,0,0.05)' }}></div>} // Placeholder for an image
        >
          <Card.Meta
            title="Event A"
            description={
              <>
                <p style={{ fontWeight: 'bold' }}>Details</p> {/* This makes 'Details' a bold title */}
                <p>Here are the details of the event...</p>
              </>
            }
          />
          <Button type="primary" style={{ margin: '10px 0' }}>
            Details
          </Button>
        </Card>
      </div>

      {/* Event Insights */}
      <div style={{ flex: 2, margin: '20px', padding: '20px', borderRadius: '8px', backgroundColor: 'white' }}>
        <h2>Event Insights</h2>
        <Statistic title="TOTAL" value={`${ticketSales.totalSold}/${ticketSales.totalAvailable}`}/>
        <Divider style={{margin:'10px 0px'}}></Divider>
        <Table
        
          dataSource={ticketSales.ticketCategories}
          columns={columns}
          pagination={false}
          bordered
          size="small"
        />
        <Row gutter={16} style={{marginTop:'20px'}}>
          <Col span={12}>
            <Button block onClick={handleUpdateEvent}>update event</Button>
          </Col>
          <Col span={12}>
            <Button block onClick={handleCancelEvent} danger>cancel event</Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}
