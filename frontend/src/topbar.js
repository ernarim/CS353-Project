import React from "react";
import { Menu, Typography } from "antd";
import { Link, useLocation } from 'react-router-dom';
import './style.scss';
const { Title } = Typography;

const Topbar = () => {
  const currentLocation = useLocation();


  const items = [
    { key: 'home_logo', label: <Link to="/"><span className="site-name">Logo</span></Link>, className: "home-logo" },
    { key: 'page_name', label:<Link to="/home"><span className="site-name">Home</span></Link>, className: "page-name" },
    { key: 'page_name', label:<span className="site-name">Title2</span>, className: "page-name" },
  ];

  return (
    <>
      <Menu theme="dark" mode="horizontal" selectable={false} items={items} style={{ flex: 1, minWidth: 0 }} />
    </>
  );
};

export default Topbar;
