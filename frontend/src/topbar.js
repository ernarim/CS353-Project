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
    { key: 'home_logo', label: <Link to="/home"><Title level={4} style={{color:'white',margin:'17px 0px'}} className="site-name">PICKaTICKET</Title></Link>, className: "home-logo" },
    { key: 'select_ticket', label:<Link to="/select_ticket"><span className="site-name">Select Ticket</span></Link>, className: "page-name" },
    { key: 'event_detail', label:<Link to="/event_detail"> <span className="site-name">Event Detail</span></Link>, className: "page-name" },
    { key: 'shopping_cart', label:<Link to="/shopping_cart"><span className="site-name">Shopping Cart</span></Link> , className: "page-name" },
    { key: 'create_event', label:<Link to="/create_event"><span className="site-name">Create Event</span></Link>, className: "page-name" },
    { key: 'ticket_category_and_seating', label:<Link to="/ticket_category_and_seating"> <span className="site-name">Ticket Category And Seating</span></Link>, className: "page-name" },
    { key: 'location_request', label:<Link to="/location_request"><span className="site-name">Location Request</span></Link> , className: "page-name" },
    { key: 'event_insight', label:<Link to="/event_insight"> <span className="site-name">Event Insight</span></Link>, className: "page-name" },
    { key: 'buyer_profile', label:<Link to="/buyer_profile"><span className="site-name">Buyer Profile</span></Link> , className: "page-name" },
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
    <Col span={4} style={{ textAlign: 'right', display: 'flex', justifyContent: 'center' }}>
      <Badge count={5}>
        <Link to="/shopping_cart" style={{ lineHeight: 'inherit', display: 'inline-flex' }}>
          <ShoppingCartOutlined style={{ fontSize: '24px', color: '#fff' }} />
        </Link>
      </Badge>
      <Link to="/buyer_profile" style={{ lineHeight: 'inherit', display: 'inline-flex', marginLeft: '20px' }}>
        <UserOutlined style={{ fontSize: '24px', color: '#fff' }} />
      </Link>
    </Col>
  </Row>
  );
};

export default Topbar;
