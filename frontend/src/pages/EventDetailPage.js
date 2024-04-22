
import React from 'react';
import { Card, Button, List } from 'antd';


export function EventDetailPage () {
    const ticketTypes = [
        { type: 'A', price: '1500TL' },
        { type: 'B', price: '750TL' },
        // ... add other ticket types here
      ];
    
      return (
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
          {/* Event Image and Details */}
          <div style={{ flex: 3, margin:'20px' }}>
          <Card
                cover={<div style={{ height: '200px', background: 'rgba(0,0,0,0.05)' }}></div>} // Placeholder for an image

                //cover={<img alt="example" src="event-image.jpg" />} // Replace "event-image.jpg" with the path to your event image
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
            </Card>
          </div>
    
          {/* Ticket Types and Organizer */}
          <div style={{ flex: 2,margin:'20px', backgroundColor:'white', padding:'20px', borderRadius:'8px'  }}>
            <h3>Organizer</h3>
            <p>Name of Organizer...</p> {/* Replace with actual organizer name */}
            <h3>Venue</h3>
            <p>venue of the event..</p> {/* Replace with actual organizer name */}
            <h3>Ticket Types</h3>
            <List
              itemLayout="horizontal"
              dataSource={ticketTypes}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={`Type ${item.type}`}
                    description={`${item.price}`}
                  />
                </List.Item>
              )}
            />
    
            <Button type="primary" style={{ width: '100%', marginTop: '10px' }}>
              Choose Ticket
            </Button>
          </div>
        </div>
      );
}