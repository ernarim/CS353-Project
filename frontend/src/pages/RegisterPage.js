import React, { useState } from 'react';
import {Tabs, Form, Input, Button, Radio, DatePicker, message } from 'antd';
import { useParams, Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Axios from '../Axios';

const { TabPane } = Tabs;

export function RegisterPage (){
    const { type } = useParams();
    const navigate = useNavigate();

    const onFinish = (values) => {
      if (values.birth_date) {
        values.birth_date = values.birth_date.format('YYYY-MM-DD');
      }
      delete values.confirm_password;
      console.log('Received values of form: ', values);

      try {
        Axios.post(`/auth/register/${type}`, values);
          message.success('Registration successful');
        navigate('/login');
      }
      catch (error) {
        console.error('Registration failed', error);
      }

    };

    const handleTabChange = (key) => {
      if (key === "1") {
        navigate("/register/ticketbuyer");
      } else if (key === "2") {
        navigate("/register/eventorganizer");
      }
    };
    

    const disabledDate = (current) => {
      return current && current >= moment().startOf('day');
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            Welcome to PICKaTICKET
          </div>
          <Tabs defaultActiveKey={type==="ticketbuyer" ? "1" : "2"} onChange={handleTabChange} centered>
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
                <Form.Item name="birth_date" rules={[{ required: true, message: 'Please input your birth date!' }]}>
                  <DatePicker style={{ width: '100%' }} placeholder="Birth Date"  disabledDate={disabledDate}/>
                </Form.Item>
                <Form.Item name="phone"  rules={[{ required: true, message: 'Please input your phone number!' }]}>
                <Input placeholder="Phone Number" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item name="confirm_password" dependencies={['password']} hasFeedback rules={[
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
                <Form.Item style={{ display:'flex', justifyContent:'center' }}> 
                  <Link to="/login">Already have an account? Log in</Link>
               </Form.Item>

                
              </Form>
            </TabPane>
            <TabPane tab="Event Organizer" key="2">
              <Form onFinish={onFinish} layout="vertical">
                <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item name="organizer_name" rules={[{ required: true, message: 'Please input your organizer name!' }]}>
                  <Input placeholder="Organizer Name" />
                </Form.Item>
                <Form.Item name="phone" rules={[{ required: true, message: 'Please input your phone number!' }]}>
                  <Input placeholder="Phone Number" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                  <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item name="confirm_password" dependencies={['password']} hasFeedback rules={[
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
                <Form.Item style={{ display:'flex', justifyContent:'center' }}> 
                  <Link to="/login">Already have an account? Log in</Link>
               </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      );
}