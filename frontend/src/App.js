import React, { useEffect } from "react";
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AppLayout } from "./layout";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import { ConfigProvider, theme } from 'antd';
import {MainPage} from "./pages/MainPage";
import { Theme } from "./style/theme";
import { ToastContainer } from 'react-toastify';
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { SelectTicketPage } from "./pages/SelectTicketPage";
import { ShoppingCartPage } from "./pages/ShoppingCartPage";
import { CreateNewEventPage } from "./pages/CreateNewEventPage";

function App() {

  const routesConfig = [
    
    { path: "/login", element: <LoginPage />, },
    { path: "/register", element: <RegisterPage/>, },
    {
      element: <AppLayout />,
      children: [
        { path: "/", element:  <MainPage/>, },
        { path: "/select_ticket/:eventId?", element:  <SelectTicketPage/>, },
        { path: "/event_detail/:id?", element:  <EventDetailPage/>,},
        { path: "/shopping_cart", element:  <ShoppingCartPage/>,},
        { path: "/create_event", element:  <CreateNewEventPage/>,},

      ],
      errorElement:  <></>
    },

    
  ];

  return (
      <React.Fragment>
          <RouterProvider router={createBrowserRouter(routesConfig)} />
          <ToastContainer position="bottom-right"/>
      </React.Fragment>
  );
}

export default App;
