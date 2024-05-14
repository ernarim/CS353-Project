// src/pages/AdminPage.js
import React, { useState, useEffect } from "react";
import { Tabs, Table , Button} from "antd";
import Axios from "../Axios";
import { Theme } from "../style/theme";
import moment from 'moment';
import "../style/admin.css";

const { TabPane } = Tabs;
const { colors, font } = Theme;

const ticketBuyers = [
    {
        key: '1',
        email: 'buyer1@example.com',
        phone: '123-456-7890',
        last_login: '2024-05-14T19:41:51.240Z',
        balance: 100,
        birth_date: '1990-01-01T00:00:00.000Z',
        name: 'John',
        surname: 'Doe',
    },
    {
        key: '2',
        email: 'buyer2@example.com',
        phone: '987-654-3210',
        last_login: '2024-05-13T19:41:51.240Z',
        balance: 200,
        birth_date: '1985-05-05T00:00:00.000Z',
        name: 'Jane',
        surname: 'Smith',
    },
    // Add more ticket buyers as needed
];

const eventOrganizers = [
    {
        key: '1',
        email: 'organizer1@example.com',
        phone: '123-456-7890',
        last_login: '2024-05-14T19:51:18.266Z',
        balance: 500,
        organizer_name: 'Organizer One',
    },
    {
        key: '2',
        email: 'organizer2@example.com',
        phone: '987-654-3210',
        last_login: '2024-05-13T19:51:18.266Z',
        balance: 1000,
        organizer_name: 'Organizer Two',
    },
    // Add more event organizers as needed
];


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

// Columns for Ticket Buyers Table
const ticketBuyersColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Surname', dataIndex: 'surname', key: 'surname' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Balance', dataIndex: 'balance', key: 'balance' },
    {
        title: 'Birth Date',
        dataIndex: 'birth_date',
        key: 'birth_date',
        render: (text) => moment(text).format('YYYY-MM-DD'),
    },   
];

const verifiedLocationsColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'Street', dataIndex: 'street', key: 'street' },
    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
];



const eventOrganizersColumns = [
    { title: 'Organizer Name', dataIndex: 'organizer_name', key: 'organizer_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Balance', dataIndex: 'balance', key: 'balance' },
];

export function AdminPage() {
    const [locationRequests, setLocationRequests] = useState([]);
    const [eventOrganizers, setEventOrganizers] = useState([]);
    const [ticketBuyers, setTicketBuyers] = useState([]);


    useEffect(() => {
        fetchLocationRequests();
        fetchEventOrganizers();
        fetchTicketBuyers();

    }, []);

    const fetchEventOrganizers = async () => {
        let response = await Axios.get("/admin/event_organizers");
        console.log("Response: ", response); //TEST
        setEventOrganizers(response.data);
    };

    const fetchTicketBuyers = async () => {
        let response = await Axios.get("/admin/ticket_buyers");
        console.log("Response: ", response); //TEST
        setTicketBuyers(response.data);
    };

    const fetchLocationRequests = async () => {
        let response = await Axios.get("/admin/location_requests");
        console.log("Response: ", response); //TEST
        setLocationRequests(response.data);
    };

    const handleAccept = async (record) => {
        console.log("Accepting location request: ", record);
        try {
            let response = await Axios.post("/admin/accept_location", {
                location_id: record.key,
            });
            console.log("Response: ", response); //TEST
            fetchLocationRequests();
        } catch (error) {
            console.error("Failed to accept location request", error);
        }
    }

    const handleReject = async (record) => {
        console.log("Rejecting location request: ", record);
        try {
            let response = await Axios.post("/admin/reject_location", {
                location_id: record.key,
            });
            console.log("Response: ", response); //TEST
            fetchLocationRequests();
        } catch (error) {
            console.error("Failed to reject location request", error);
        }
    }



    const locationColumns = [

        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Organizer Name', dataIndex: 'organizer_name', key: 'organizer_name'},
        { title: 'City', dataIndex: 'city', key: 'city' },
        { title: 'State', dataIndex: 'state', key: 'state' },
        { title: 'Street', dataIndex: 'street', key: 'street' },
        { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <span>
                    <Button
                        type="primary"
                        style={{ backgroundColor: 'green', borderColor: 'green', marginRight: 8 }}
                        onClick={() => handleAccept(record)}
                    >
                        Accept
                    </Button>
                    <Button
                        type="primary"
                        style={{ backgroundColor: 'red', borderColor: 'red' }}
                        onClick={() => handleReject(record)}
                    >
                        Reject
                    </Button>
                </span>
            ),
        },
    ];
 
    return (
        <div className="admin-page" style={{display:'flex', flexDirection:'column', alignItems:'center', width:'90%', height:'100vh', padding:'0px 5%' }}>
            <h2 style={{color:'white'}}>Welcome to The Admin Panel!</h2>
            <Tabs style={{width:'100%'}} defaultActiveKey="1">
                <TabPane tab="Ticket Buyers" key="2">
                    <Table dataSource={ticketBuyers} columns={ticketBuyersColumns} />
                </TabPane>
                <TabPane tab="Event Organizers" key="3">
                    <Table dataSource={eventOrganizers} columns={eventOrganizersColumns} />
                </TabPane>
                <TabPane tab="Location Requests" key="1">
                    <Table dataSource={locationRequests} columns={locationColumns} />
                </TabPane>
            </Tabs>
        </div>
    );
}
