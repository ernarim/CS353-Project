import React, { useEffect } from "react";
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AppLayout } from "./layout";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import { ConfigProvider, theme } from 'antd';
import {MainPage} from "./pages/MainPage";
import { Theme } from "./style/theme";
import { ToastContainer } from 'react-toastify';

function App() {

  const routesConfig = [
    {
      element: <AppLayout />,
      children: [
        { path: "/", element:  <MainPage/>, },
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
