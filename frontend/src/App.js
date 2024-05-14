import React, { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { AppLayout } from "./layout";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import { ConfigProvider, theme } from "antd";
import { MainPage } from "./pages/MainPage";
import { Theme } from "./style/theme";
import { ToastContainer } from "react-toastify";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { SelectTicketPage } from "./pages/SelectTicketPage";
import { ShoppingCartPage } from "./pages/ShoppingCartPage";
import { CreateNewEventPage } from "./pages/CreateNewEventPage";
import { TicketCategoryAndSeatingPage } from "./pages/TicketCategoryAndSeatingPage";
import { NewLocationRequestPage } from "./pages/NewLocationRequestPage";
import { EventInsightPage } from "./pages/EventInsightPage";
import { BuyerProfilePage } from "./pages/BuyerProfilePage";
import { UpdateEventPage } from "./pages/UpdateEventPage";
import { AdminPage } from "./pages/AdminPage";

function App() {
  const routesConfig = [
    { path: "/login", element: <LoginPage /> },
    { path: "/register/:type", element: <RegisterPage /> },
    { path: "/admin", element: <AdminPage />},
    {
      element: <AppLayout />,
      children: [
        { path: "/", element: <Navigate to="/login" replace /> },
        { path: "/home", element: <MainPage /> },
        { path: "/select_ticket/:event_id", element: <SelectTicketPage /> },
        { path: "/event_detail/:event_id", element: <EventDetailPage /> },
        { path: "/shopping_cart", element: <ShoppingCartPage /> },
        { path: "/create_event", element: <CreateNewEventPage /> },
        {
          path: "/ticket_category_and_seating",
          element: <TicketCategoryAndSeatingPage />,
        },
        { path: "/location_request", element: <NewLocationRequestPage /> },
        { path: "/event_insight/:event_id", element: <EventInsightPage /> },
        { path: "/buyer_profile", element: <BuyerProfilePage /> },
        { path: "/update_event/:event_id", element: <UpdateEventPage /> },
      ],
      errorElement: <></>,
    },
  ];

  return (
    <React.Fragment>
      <RouterProvider router={createBrowserRouter(routesConfig)} />
      <ToastContainer position="bottom-right" />
    </React.Fragment>
  );
}

export default App;
