import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Card } from 'antd';

export const NewLocationRequestPage = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    // Here you can handle the form submission, send the data to a server, etc.
  };

  return (
    <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>

        <Card title="Submit New Location Request" style={{ width: 500, margin:20 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please input the name!' }]}
            >
                <Input placeholder="Enter location name" />
            </Form.Item>

            <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please input the city!' }]}
            >
                <Input placeholder="Enter city" />
            </Form.Item>

            <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please input the state!' }]}
            >
                <Input placeholder="Enter state" />
            </Form.Item>

            <Form.Item
                name="street"
                label="Street"
                rules={[{ required: true, message: 'Please input the street!' }]}
            >
                <Input placeholder="Enter street address" />
            </Form.Item>

            <Form.Item
                name="capacity"
                label="Capacity"
                rules={[{ required: true, message: 'Please input the capacity!' }]}
            >
                <InputNumber placeholder="Enter capacity" min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="rowCount"
                label="Row Count"
                rules={[{ required: true, message: 'Please input the row count!' }]}
            >
                <InputNumber placeholder="Enter row count" min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="columnCount"
                label="Column Count"
                rules={[{ required: true, message: 'Please input the column count!' }]}
            >
                <InputNumber placeholder="Enter column count" min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" style={{width:'100%'}}>
                Send Request
                </Button>
            </Form.Item>
            </Form>
        </Card>
    </div>

  );
};

