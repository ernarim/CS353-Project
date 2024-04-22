import React from "react";
import { Menu, Typography } from "antd";
import { Link, useLocation } from 'react-router-dom';
const { Title } = Typography;

const Topbar = () => {
  //const currentLocation = useLocation();


  const items = [
    { key: 'home_logo', label: <Link to="/"><span className="site-name">Logo</span></Link>, className: "home-logo" },
    { key: 'page_name', label:<Link to="/"><span className="site-name">Home</span></Link>, className: "page-name" },
    { key: 'page_name', label:<span className="site-name">Events</span>, className: "page-name" },
    { key: 'page_name', label:<span className="site-name">Contact</span>, className: "page-name" },
  ];

  return (
    <>
      <Menu theme="dark" mode="horizontal" selectable={false} items={items} />
    </>
  );
};

export default Topbar;
