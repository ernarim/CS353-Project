import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import Axios from '../Axios';


export function LoginPage() {
    const onFinish = (values) => {
        console.log('Success:', values);
        
        try {
            Axios.post('/auth/login', values)
                .then((response) => {
                    console.log(response);
                    if (response.status === 200) {
                        console.log('Login successful');
                    }
                })
                .catch((error) => {
                    console.error('Login failed', error);
                });
        }
        catch (error) {
            console.error('Login failed', error);
        }

        

    };
    


  
    
    
      return (
        <div style={{height:'80vh', padding: '50px', maxWidth: '300px', margin: 'auto', display:'flex', flexDirection:'column',justifyContent:'center', alignItems:'center' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            PICKaTICKET
          </div>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your Email!' }]}
            >
              <Input placeholder="email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input
                type="password"
                placeholder="password"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }}>
                Log in
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              Register as: <a href="/register">Ticket Buyer</a> or <a href="/register">Event Organizer</a>
            </div>
          </Form>
        </div>
    );
}