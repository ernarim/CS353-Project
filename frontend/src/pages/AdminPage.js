// src/pages/AdminPage.js
import React, { useState, useEffect } from "react";
import { Tabs, Table } from "antd";
import Axios from "../Axios";

const { TabPane } = Tabs;

const locationRequests = [
    {
        key: '1',
        name: 'Location 1',
        city: 'City 1',
        state: 'State 1',
        street: 'Street 1',
        capacity: 100,
    },
    {
        key: '2',
        name: 'Location 2',
        city: 'City 2',
        state: 'State 2',
        street: 'Street 2',
        capacity: 200,
    },
    // Add more location requests as needed
];

const locationColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'Street', dataIndex: 'street', key: 'street' },
    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
];

export function AdminPage() {
    const [locationRequests, setLocationRequests] = useState([]);

    useEffect(() => {
        fetchLocationRequests();
    }, []);

    const fetchLocationRequests = async () => {
        let response = Axios.get("/admin/location_requests");
        console.log("Response: ", response); //TEST
        setLocationRequests(response.data);
    };

 
    return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'90%', margin:'0px 5%' }}>
            <p>Welcome to the admin panel!</p>
            <Tabs style={{width:'100%'}} defaultActiveKey="1">
                <TabPane tab="Location Requests" key="1">
                    <Table dataSource={locationRequests} columns={locationColumns} />
                </TabPane>
                {/* Add more tabs as needed */}
            </Tabs>
        </div>
    );
}
