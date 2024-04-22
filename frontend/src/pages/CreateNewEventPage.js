import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Switch, InputNumber, Card } from 'antd';


export function CreateNewEventPage ()  {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    // other fields
  });

  const handleFormChange = (changedValues, allValues) => {
    setFormData(allValues);
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    // Here you would typically send the data to a server or some other handling function
  };

  return (
    <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
      <Card title={"Create New Event"} style={{width:600, margin:20}}>
      <Form onValuesChange={handleFormChange} onFinish={handleSubmit}>
        <Form.Item label="Event Title" name="title" rules={[{ required: true }]}>
          <Input placeholder="Enter event title" />
        </Form.Item>
        <Form.Item label="Date / Time" name="date" rules={[{ required: true }]}>
          <DatePicker showTime placeholder="Select time" />
        </Form.Item>
        <Form.Item label="Category" name="category">
          <Select placeholder="Select a category">
            {/* Add Select.Option components here */}
          </Select>
        </Form.Item>
        {/* ...other form items... */}
        <Form.Item label="Smoke" name="smoke">
          <Switch />
        </Form.Item>
        <Form.Item label="Alcohol" name="alcohol">
          <Switch />
        </Form.Item>
        <Form.Item label="Age (from)" name="age">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item label="Max Ticket Purchase" name="maxTicketPurchase">
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Publish Event
          </Button>
        </Form.Item>
      </Form>
      </Card>
    </div>

  );
};

