import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Checkbox, message } from 'antd';
import Axios from '../Axios';


export  function AdminLoginPage()  {
  const navigate = useNavigate();


    const onFinish =  async (values) => {
        const formData = new FormData();
        formData.append('username', values.email);
        formData.append('password', values.password);
        
        const config = {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        
        try{
          let result = await Axios.post('/auth/login/admin', formData, config);
          let accessToken = result.data.access_token;
          localStorage.setItem("token", accessToken);
          Axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;


          try {
            let result = await Axios.get('/auth/me');
            console.log(result.data);
            let userId = result.data.user_id;
            localStorage.setItem("user", JSON.stringify(result.data));
            console.log(result.data);
            let user = JSON.parse(localStorage.getItem("user"));
            localStorage.setItem("userId", userId);
            localStorage.setItem("user", JSON.stringify(result.data));
            message.success('Login successful');

            navigate('/admin/panel');
          }
          catch (error) {
            console.error('User info failed', error);
          } 

        }
        catch (error) {
          console.error('Login failed', error);
          message.error('Email or password wrong');
          
        } 

      


    };
  
      return (
        <div style={{height:'80vh', padding: '50px', width: '280px', margin: 'auto', display:'flex', flexDirection:'column',justifyContent:'center', alignItems:'center' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>
            Admin Login
          </div>
          <div style={{ marginBottom: '24px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            PICKaTICKET
          </div>
          
          <Form style={{ width: '100%' }}
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your Email!' }]}
            >
              <Input placeholder="username" />
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
       
          </Form>
        </div>
    );
}