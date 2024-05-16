import React, { useEffect, useState } from "react";
import { Menu, Typography, Row, Col, Badge } from "antd";
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Topbar = () => {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedUserType = localStorage.getItem('userType');
    if (storedUser) {
      setUserType(storedUserType);
      setUserId(storedUser.user_id);
      console.log("user type", storedUser.userType);
      console.log("user id", storedUser.user_id);
    }
  }, []);

  const handleProfileClick = () => {
    if (userType == 'organizer') {
      navigate(`/org_profile/${userId}`);
    } else {
      navigate(`/buyer_profile/${userId}`);
    }
  };

  const commonItems = [
    { key: 'home_logo', label: <Link to="/home"><Title level={4} style={{ color: 'white', margin: '17px 0px' }} className="site-name">PICKaTICKET</Title></Link>, className: "home-logo" },
  ];

  const buyerItems = [
    ...commonItems,
  ];

  const organizerItems = [
    ...commonItems,
    { key: 'create_event', label: <Link to="/create_event"><span className="site-name">Create Event</span></Link>, className: "page-name" },
    { key: 'location_request', label: <Link to="/location_request"><span className="site-name">Location Request</span></Link>, className: "page-name" },
  ];

  const items = userType === 'organizer' ? organizerItems : buyerItems;

  return (
    <Row align="middle" style={{ padding: '0 50px' }}>
      <Col span={20}>
        <Menu theme="dark" mode="horizontal" selectable={false} items={items} />
      </Col>
      <Col span={4} style={{ textAlign: 'right', display: 'flex', justifyContent: 'center' }}>
        {userType !== 'organizer' && (
          <Badge count={0}>
            <Link to="/shopping_cart" style={{ lineHeight: 'inherit', display: 'inline-flex' }}>
              <ShoppingCartOutlined style={{ fontSize: '24px', color: '#fff' }} />
            </Link>
          </Badge>
        )}
        <div onClick={handleProfileClick} style={{ lineHeight: 'inherit', display: 'inline-flex', marginLeft: '20px', cursor: 'pointer' }}>
          <UserOutlined style={{ fontSize: '24px', color: '#fff' }} />
        </div>
      </Col>
    </Row>
  );
};

export default Topbar;
