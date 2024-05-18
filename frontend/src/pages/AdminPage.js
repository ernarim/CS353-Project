import React, { useState, useEffect } from "react";
import { Tabs, Table, Button, message, Card, Statistic, Row, Col, Modal } from "antd";
import { ArrowUpOutlined, PauseCircleOutlined, UserOutlined, RocketOutlined, HomeOutlined, NotificationOutlined, CloseCircleFilled, BookOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Axios from "../Axios";
import moment from 'moment';
import "../style/admin.css";
import { AdminReportPage } from "./AdminReportPage";

const { TabPane } = Tabs;



export function AdminPage() {
    const navigate = useNavigate();


    const [activeTab, setActiveTab] = useState("1");
    const [stats, setStats] = useState({
        ticketBuyersCount: 0,
        eventOrganizersCount: 0,
        locationRequestsCount: 0,
        verifiedLocationsCount: 0,
        eventsCount: 0,
        reportsCount: 0,
    });

    const [locationRequests, setLocationRequests] = useState([]);
    const [eventOrganizers, setEventOrganizers] = useState([]);
    const [ticketBuyers, setTicketBuyers] = useState([]);
    const [verifiedLocations, setVerifiedLocations] = useState([]);
    const [events, setEvents] = useState([]);
    const [reports, setReports] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    useEffect(() => {
        switch (activeTab) {
            case "2":
                fetchAllEvents();
                break;
            case "3":
                fetchTicketBuyers();
                break;
            case "4":
                fetchEventOrganizers();
                break;
            case "5":
                fetchLocationRequests();
                break;
            case "6":
                fetchVerifiedLocations();
                break;
            case "7":
                fetchReports();
            default:
                break;
        }
    }, [activeTab]);

    const fetchStatistics = async () => {
        fetchTicketBuyers();
        fetchEventOrganizers();
        fetchLocationRequests();
        fetchVerifiedLocations();
        fetchAllEvents();
        fetchReports();
    };

    const fetchEventOrganizers = async () => {
        let response = await Axios.get("/admin/event_organizers");
        console.log("Response: ", response.data); //TEST
        setEventOrganizers(response.data);
        setStats(prevStats => ({ ...prevStats, eventOrganizersCount: response.data.length }));
    };

    const fetchTicketBuyers = async () => {
        let response = await Axios.get("/admin/ticket_buyers");
        console.log("Response: ", response.data); //TEST
        setTicketBuyers(response.data);
        setStats(prevStats => ({ ...prevStats, ticketBuyersCount: response.data.length }));
    };

    const fetchAllEvents = async () => {
        let response = await Axios.get("/event/all");
        console.log("Response: ", response.data); //TEST
        setEvents(response.data);
        setStats(prevStats => ({ ...prevStats, eventsCount: response.data.length }));
    };

    const fetchLocationRequests = async () => {
        let response = await Axios.get("/admin/location_requests");
        console.log("Response: ", response.data); //TEST
        setLocationRequests(response.data);
        setStats(prevStats => ({ ...prevStats, locationRequestsCount: response.data.length }));
    };

    const fetchVerifiedLocations = async () => {
        let response = await Axios.get("/venue");
        console.log("Response: ", response.data); //TEST
        setVerifiedLocations(response.data);
        setStats(prevStats => ({ ...prevStats, verifiedLocationsCount: response.data.length }));
    };

    const fetchReports = async () => {
        let response = await Axios.get("/report");
        console.log("Response: ", response.data); //TEST
        setReports(response.data);
        setStats(prevStats => ({ ...prevStats, reportsCount: response.data.length }));

    };


    const handleAccept = async (record) => {
        console.log("Accepting location request: ", record);

        try {
            let response = await Axios.patch("/admin/verify/" + record.venue_id)
            console.log("Response: ", response); //TEST
            message.success("Location request accepted!");
            fetchLocationRequests();
        } catch (error) {
            console.error("Failed to accept location request", error);
        }
    };

    const handleReject = async (record) => {
        console.log("Rejecting location request: ", record);
        try {
            let response = await Axios.patch("/admin/reject/" + record.venue_id)
            console.log("Response: ", response); //TEST
            message.success("Location request rejected!");
            fetchLocationRequests();
        } catch (error) {
            console.error("Failed to reject location request", error);
        }
    };

    const handleDeleteUser = async (record) => {
        console.log("Deleting user: ", record.user_id);
        try {
            let response = await Axios.delete("/user/" + record.user_id);
            console.log("Response: ", response); //TEST
            message.success("User deleted successfully!");
            fetchStatistics();
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleShowStatistics = async (organizer) => {
        navigate(`/admin/report/${organizer.user_id}`);
    };

    const handleShowReport = (record) => {
        console.log("Showing report: ", record);
        setSelectedReport(record);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedReport(null);
    };

    const handleEventDetails = (record) => {
        console.log("Event Details: ", record);
        navigate(`/event_insight/${record.event_id}`);
    };

    const handleDeleteLocation = async (record) => {
        console.log("Deleting location: ", record.venue_id);
        try {
            let response = await Axios.delete("/venue/" + record.venue_id);
            console.log("Response: ", response); //TEST
            message.success("Location deleted successfully!");
            fetchStatistics();
        } catch (error) {
            console.error("Failed to delete location", error);
            if(error.response.status === 500) {
                message.error("Location cannot be deleted because it is associated with an event!");
            }
        }
    };

    const handleReportDelete = async (record) => {
        console.log("Deleting report: ", record.report_id);
        try {
            let response = await Axios.delete("/report/" + record.report_id);
            console.log("Response: ", response); //TEST
            message.success("Report deleted successfully!");
            fetchReports();
        } catch (error) {
            console.error("Failed to delete report", error);
        }
    };
    
    const verifiedLocationsColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'City', dataIndex: 'city', key: 'city' },
        { title: 'State', dataIndex: 'state', key: 'state' },
        { title: 'Street', dataIndex: 'street', key: 'street' },
        { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
        { title: 'Options', key: 'options', render: (text, record) => (
            <Button
                type="primary"
                style={{ backgroundColor: 'red', borderColor: 'red' }}
                onClick={() => handleDeleteLocation(record)}
            >
                Delete Location
            </Button>
        )
        }
    ];

    const locationColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Organizer Name', dataIndex: 'organizer_name', key: 'organizer_name' },
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

    const eventOrganizersColumns = [
        { title: 'Organizer Name', dataIndex: 'organizer_name', key: 'organizer_name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone', dataIndex: 'phone', key: 'phone' },
        { title: 'Balance', dataIndex: 'balance', key: 'balance' },
        {
            title: 'Options',
            key: 'options',
            render: (text, record) => (
                <>
                    <Button
                        type="primary"
                        style={{ backgroundColor: 'green', borderColor: 'green', marginRight: 8 }}
                        onClick={() => handleShowStatistics(record)}
                    >
                        Show Statistics
                    </Button>
                    <Button
                        type="primary"
                        style={{ backgroundColor: 'red', borderColor: 'red' }}
                        onClick={() => handleDeleteUser(record)}
                    >
                        Delete Organizer
                    </Button>

                </>
                
            ),
        },
        
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
        {
            title: 'Options',
            key: 'delete',
            render: (text, record) => (
                <Button
                    type="primary"
                    style={{ backgroundColor: 'red', borderColor: 'red' }}
                    onClick={() => handleDeleteUser(record)}
                >
                    Delete User
                </Button>
            ),
        }
    ];

    const eventColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Organizer Name', key: 'organizer_name', render: (text, record) => record.organizer?.organizer_name || 'N/A' },
        { title: 'Date', dataIndex: 'date', key: 'date', render: (text) => moment(text).format('YYYY-MM-DD') },
        { title: 'Location', key: 'venue.name', render: (text, record) => record.venue?.name || 'N/A' },
        { title: 'Category', key: 'category', render: (text, record) => record.category?.category_name || 'N/A' },
        { title: 'Is Cancelled', dataIndex: 'is_cancelled', key: 'is_cancelled', render: (is_cancelled) => is_cancelled ? <> <CloseCircleFilled style={{color:'red', fontSize:'16px'}}/> Yes</>  : 'No' },
        { 
            title: 'See Details', 
            key: 'details',
            render: (text, record) => (
                <Button
                    type="primary"
                    style={{ backgroundColor: 'green', borderColor: 'green', marginRight: 8 }}
                    onClick={() => handleEventDetails(record)}
                >
                    Details
                </Button>
            ),
        },
    ];

    const reportColumns = [
        { title: 'Organizer Name', dataIndex: 'organizer_name', key: 'organizer_name', render: (text, record) => record?.organizer_statistics?.organizer_name || 'N/A' },
        { title: 'Date', dataIndex: 'date', key: 'date', render: (text) => moment(text).format('YYYY-MM-DD'), },
        { 
            title: 'Options', 
            key: 'options',
            render: (text, record) => ([
                <Button 
                    type="primary" 
                    style={{ backgroundColor: 'green', borderColor: 'green', marginRight: 8 }}
                    onClick={() => handleShowReport(record)}
                >
                    Show Report
                </Button>,
                <Button
                    type="primary"
                    style={{ backgroundColor: 'red', borderColor: 'green', marginRight: 8 }}
                    onClick={() => handleReportDelete(record)}
                >
                    Delete Report
                </Button>
            ])
        },
    ];
    
    const handleCardClick = (tabKey) => {
        setActiveTab(tabKey);
    };



    return (
        <div className="admin-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', height: '100vh', padding: '0px 5%' }}>
            <h2 style={{ color: 'white' }}>Welcome to The Admin Panel!</h2>
            <Tabs style={{ width: '100%' }} activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Statistics" key="1">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Card bordered={false} onClick={() => handleCardClick("2")}>
                                <Statistic
                                    title="All Events"
                                    value={stats.eventsCount}
                                    prefix={<NotificationOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card bordered={false} onClick={() => handleCardClick("3")}>
                                <Statistic
                                    title="Ticket Buyers"
                                    value={stats.ticketBuyersCount}
                                    prefix={<UserOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card bordered={false} onClick={() => handleCardClick("4")}>
                                <Statistic
                                    title="Event Organizers"
                                    value={stats.eventOrganizersCount}
                                    prefix={<RocketOutlined />}
                                />
                            </Card>
                        </Col>
                       
                       
                    </Row>
                    <Row gutter={16} style={{ marginTop: 16 }}>
                        
                        <Col span={12}>
                            <Card bordered={false} onClick={() => handleCardClick("5")}>
                                <Statistic
                                    title="Location Requests"
                                    value={stats.locationRequestsCount}
                                    valueStyle={{ color: stats.locationRequestsCount ? '#3f8600' : 'black' }}
                                    prefix={ stats.locationRequestsCount ? <ArrowUpOutlined /> : <PauseCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card bordered={false} onClick={() => handleCardClick("6")}>
                                <Statistic
                                    title="Verified Locations"
                                    value={stats.verifiedLocationsCount}
                                    prefix={<HomeOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <Card bordered={false} onClick={() => handleCardClick("7")}>
                                <Statistic
                                    title="Reports"
                                    value={stats.reportsCount}
                                    prefix={<BookOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="All Events" key="2">
                    <Table dataSource={events} columns={eventColumns} />
                </TabPane>
                <TabPane tab="Ticket Buyers" key="3">
                    <Table dataSource={ticketBuyers} columns={ticketBuyersColumns} />
                </TabPane>
                <TabPane tab="Event Organizers" key="4">
                    <Table dataSource={eventOrganizers} columns={eventOrganizersColumns} />
                </TabPane>
                <TabPane tab="Location Requests" key="5">
                    <Table dataSource={locationRequests} columns={locationColumns} />
                </TabPane>
                <TabPane tab="Verified Locations" key="6">
                    <Table dataSource={verifiedLocations} columns={verifiedLocationsColumns} />
                </TabPane>
                <TabPane tab="Reports" key="7">
                    <Table dataSource={reports} columns={reportColumns} />
                </TabPane>

            </Tabs>

        <Modal width={1700}  visible={isModalVisible} onCancel={handleModalClose} footer={null} centered>
            <AdminReportPage propOrganizerStats={selectedReport?.organizer_statistics} 
                        propParticipantStats={selectedReport?.participant_statistics} 
                        propAgeStats={selectedReport?.age_statistics}
                        propRevenueStats={selectedReport?.revenue_statistics}>

                        </AdminReportPage>
            
        </Modal>

        </div>
    );
}

export default AdminPage;
