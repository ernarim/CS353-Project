import React, { useState } from 'react';
import {Tabs, Form, Input, Button, Radio, DatePicker } from 'antd';

const { TabPane } = Tabs;

export function RegisterPage (){
    const onFinish = (values) => {
        console.log('Received values of form: ', values);
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            Welcome to PICKaTICKET
          </div>
          <Tabs defaultActiveKey="1" centered>
            <TabPane tab="Ticket Buyer" key="1">
            <Form onFinish={onFinish} layout="vertical">
                <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                <Input placeholder="Email" />
                </Form.Item>
                <Form.Item name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
                <Input placeholder="Name" />
                </Form.Item>
                <Form.Item name="surname" rules={[{ required: true, message: 'Please input your surname!' }]}>
                <Input placeholder="Surname" />
                </Form.Item>
                <Form.Item name="birthdate" rules={[{ required: true, message: 'Please input your birth date!' }]}>
                <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="phone" rules={[{ required: true, message: 'Please input your phone number!' }]}>
                <Input placeholder="Phone Number" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item name="confirmPassword" dependencies={['password']} hasFeedback rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    },
                }),
                ]}>
                <Input.Password placeholder="Password Confirmation" />
                </Form.Item>
                <Form.Item>
                <Button type="primary" htmlType="submit"  style={{ width: '100%' }}>
                    Sign Up
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Event Organizer" key="2">
              <Form onFinish={onFinish} layout="vertical">
                <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item name="organizerName" rules={[{ required: true, message: 'Please input your organizer name!' }]}>
                  <Input placeholder="Organizer Name" />
                </Form.Item>
                <Form.Item name="phone" rules={[{ required: true, message: 'Please input your phone number!' }]}>
                  <Input placeholder="Phone Number" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                  <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item name="confirmPassword" dependencies={['password']} hasFeedback rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    },
                  }),
                ]}>
                  <Input.Password placeholder="Password Confirmation" />
                </Form.Item>
                <Form.Item>
                <Button type="primary" htmlType="submit"  style={{ width: '100%' }}>
                    Sign Up
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      );
}