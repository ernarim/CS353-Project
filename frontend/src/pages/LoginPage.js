import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Checkbox, message } from 'antd';
import Axios from '../Axios';


export  function LoginPage()  {
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
          let result = await Axios.post('/auth/login', formData, config);
          let accessToken = result.data.access_token;
          localStorage.setItem("token", accessToken);
          Axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;


          try {
            const loginResult = await Axios.get('/auth/me');
            const user = loginResult.data;
            localStorage.setItem("userId", user.user_id);
            localStorage.setItem("user", JSON.stringify(user));
        
            const userDetailsResult = await Axios.get(`/auth/user_type/${user.user_id}`);
            const userDetails = userDetailsResult.data;
            localStorage.setItem("userType", userDetails.user_type);
        
            message.success('Login successful');
            navigate('/home');
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
              Register as: 
              <Link to="/register/ticketbuyer"> Ticket Buyer</Link> or 
              <Link to="/register/eventorganizer"> Event Organizer</Link>
          </div>

          </Form>
        </div>
    );
}