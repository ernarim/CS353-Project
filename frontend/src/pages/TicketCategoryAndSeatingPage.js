import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, List } from 'antd';

export function TicketCategoryAndSeatingPage () {
  const [ticketTypes, setTicketTypes] = useState([{ category: 'A', price: '1200TL' }]);
  const [noSeatingPlan, setNoSeatingPlan] = useState(false);

  const addTicketType = () => {
    const newTicketType = { category: '', price: '' };
    setTicketTypes([...ticketTypes, newTicketType]);
  };

  const handleCategoryChange = (value, index) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index].category = value;
    setTicketTypes(newTicketTypes);
  };

  const handlePriceChange = (value, index) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index].price = value;
    setTicketTypes(newTicketTypes);
  };

  const handleNoSeatingPlanChange = (e) => {
    setNoSeatingPlan(e.target.checked);
  };

  return (
    <div>
      <List
        header={<div>Ticket Category and Seating Arrangement</div>}
        bordered
        dataSource={ticketTypes}
        renderItem={(item, index) => (
          <List.Item>
            <Input
              placeholder="Category"
              value={item.category}
              onChange={(e) => handleCategoryChange(e.target.value, index)}
            />
            <Input
              placeholder="Price"
              value={item.price}
              onChange={(e) => handlePriceChange(e.target.value, index)}
            />
          </List.Item>
        )}
      />
      <Button onClick={addTicketType} type="primary">Add Ticket Type</Button>
      <Checkbox
        checked={noSeatingPlan}
        onChange={handleNoSeatingPlanChange}
      >
        No seating plan
      </Checkbox>
      {/* Here you can add a visual representation of seats if noSeatingPlan is false */}
      <div style={{ display: noSeatingPlan ? 'none' : 'block' }}>
        {/* Seating arrangement representation */}
      </div>
      <Form.Item>
        <Button type="primary">Set Tickets</Button>
      </Form.Item>
    </div>
  );
};

