import React from "react";
import { Input, Menu, Typography, Row, Col, Badge } from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
const { Title } = Typography;
const { Search } = Input;

const Topbar = () => {
  //const currentLocation = useLocation();


  const items = [
    { key: 'home_logo', label: <Link to="/"><Title level={4} style={{color:'white',margin:'17px 0px'}} className="site-name">PICKaTICKET</Title></Link>, className: "home-logo" },
    { key: 'select_ticket', label:<Link to="/select_ticket"><span className="site-name">Select Ticket</span></Link>, className: "page-name" },
    { key: 'event_detail', label:<Link to="/event_detail"> <span className="site-name">Event Detail</span></Link>, className: "page-name" },
    { key: 'shopping_cart', label:<Link to="/shopping_cart"><span className="site-name">Shopping Cart</span></Link> , className: "page-name" },
  ];

  return (
    <Row align="middle" style={{padding:'0 50px'}}>
    <Col span={8} >
      <Menu theme="dark" mode="horizontal" selectable={false} items={items}  />
    </Col>
    <Col span={8} offset={4} style={{display:'flex', justifyContent:'center'}}>
      <Search
        placeholder="Search for an event"
        onSearch={value => console.log(value)}
        style={{ width: 200 }}
      />
    </Col>
    <Col span={4} style={{ textAlign: 'right',display:'flex', justifyContent:'center' }}>
      <Badge count={5}>
        <ShoppingCartOutlined style={{ fontSize: '24px', color: '#fff' }} />
      </Badge>
      <UserOutlined style={{ fontSize: '24px', color: '#fff', marginLeft: '20px' }} />
    </Col>
  </Row>
  );
};

export default Topbar;
