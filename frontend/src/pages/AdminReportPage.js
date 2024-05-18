import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Axios from '../Axios';
import { Card, Row, Col, Statistic, Typography, Descriptions } from 'antd';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ScatterChart, Scatter } from 'recharts';


import '../style/admin.css';

const { Title, Text } = Typography;


const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
    return (
        <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>
            {value}
        </text>
    );
};

export function AdminReportPage() {
    const { organizer_id } = useParams();
    
    const [organizerStats, setOrganizerStats] = useState(null);
    const [ageStats, setAgeStats] = useState(null);
    const [participantStats, setParticipantStats] = useState(null);
    const [revenueStats, setRevenueStats] = useState(null);


    const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"];

    
    useEffect(() => {
        fetchOrganizerStatistics();
        fetchAgeStatistics();
        fetchParticipiantStatictics();
        fetchRevenueStatistics();

    }, [organizer_id]);

    const fetchOrganizerStatistics = async () => {
        try {
            let response = await Axios.get(`/admin/organizer_info/${organizer_id}`);
            console.log("Organizer Stats", response.data);
            setOrganizerStats(response.data);
        } catch (error) {
            console.error("Failed to fetch organizer statistics", error);
        }
    };

    const fetchParticipiantStatictics = async () => {
        try {
            let response = await Axios.get(`/admin/participant_statistics/${organizer_id}`);
            console.log("Participant Stats", response.data);
            setParticipantStats(response.data);
        } catch (error) {
            console.error("Failed to fetch age statistics", error);
        }
    }

    const fetchAgeStatistics = async () => {
        try {
            let response = await Axios.get(`/admin/age_statistics/${organizer_id}`);
            console.log("Age Stats", response.data);
            setAgeStats(response.data);
        } catch (error) {
            console.error("Failed to fetch age statistics", error);
        }
    }

    const fetchRevenueStatistics = async () => {
        try {
            let response = await Axios.get(`/admin/revenue_statistics/${organizer_id}`);
            console.log("Revenue Stats", response.data);
            setRevenueStats(response.data);
        } catch (error) {
            console.error("Failed to fetch revenue statistics", error);
        }
    }


    const renderBarChart = (data, title) => (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={[data]}
                margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar dataKey="total_sold_tickets" fill="#82ca9d" name="Sold Tickets" />
                <Bar dataKey="total_unsold_tickets" fill="#ffc658" name="Unsold Tickets" />
            </BarChart>
        </ResponsiveContainer>
    );


    return (
        <div className="admin-page" style={{padding:'1%'}}>
            <div className="stat-card">
            {organizerStats && <>
                <Row gutter={16} > 
                        <Col span={24}>
                            <Card>
                                <Statistic
                                    title="Organizer Name"
                                    value={organizerStats.organizer_name}
                                />
                            </Card>
                        </Col>
                        
                    
            </Row>

            <Row gutter={16}>
                <>
                    <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Current Balance"
                                    value={organizerStats.current_balance}
                                    precision={2}
                                    valueStyle={{ color: '#3f8600' }}
                                    suffix="$"
                                />
                            </Card>
                        </Col>
                        <Col span={6} >
                            <Card>
                                <Statistic
                                    title="Sold Tickets"
                                    value={organizerStats.sold_tickets}
                                />
                            </Card>
                        </Col>
                        <Col span={6} >
                            <Card>
                                <Statistic
                                    title="Unsold Tickets"
                                    value={organizerStats.unsold_tickets}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Total Events"
                                    value={organizerStats.total_events}
                                />
                            </Card>
                        </Col>
                </>
                </Row>

            </>
            }
            
            </div>
            <div className='stat-card'>
                <Row gutter={16} style={{marginTop:'15px'}}>
                    <Col span={12}>
                        <Card title="Age Distribution of Ticket Buyers" bordered={false}>
                        <ResponsiveContainer width="100%" height={230}>
                            {ageStats && (
                            <PieChart>
                                <Pie
                                data={ageStats?.age_distribution}
                                dataKey="count"
                                nameKey="age_group"
                                cx="50%"
                                cy="50%"
                                outerRadius={86}
                                fill="#8884d8"
                                label
                                >
                                {ageStats?.age_distribution.map((entry, index) => (
                                    <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                            )}
                        </ResponsiveContainer>
                        </Card>
                        <Row gutter={16} >
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="Max Age"
                                        value={ageStats?.max_age}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="Min Age"
                                        value={ageStats?.min_age}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card title="Event with Minimum Participants" bordered={false} style={{height: '24vw', color:'white'}}>
                                {participantStats && participantStats.min_participants_events && participantStats.min_participants_events.length > 0 ? (
                                    <>
                                        <div >
                                            <Title level={5}>Title</Title>
                                            <Text>{participantStats.min_participants_events[0].event_title}</Text>
                                        </div>
                                        <div >
                                            <Title level={5}>Category</Title>
                                            <Text>{participantStats.min_participants_events[0].event_category}</Text>
                                        </div>
                                        <div >
                                            <Title level={5}>Minimum Participants</Title>
                                            <Text>{participantStats.min_participants_events[0].participant_count} participants</Text>
                                        </div>
                                    </>
                                ) : (
                                    <Text>No data available</Text>
                                )}
                            </Card>
                        </Col>
                        <Col span={12}> 


                            <Card title="Event with Maximum Participants" bordered={false} style={{height: '24vw', color:'white'}}>
                                {participantStats && participantStats.max_participants_events && participantStats.max_participants_events.length > 0 ? (
                                    <>
                                        <div >
                                            <Title level={5}>Title</Title>
                                            <Text>{participantStats.max_participants_events[0].event_title}</Text>
                                        </div>
                                        <div >
                                            <Title level={5}>Category</Title>
                                            <Text>{participantStats.max_participants_events[0].event_category}</Text>
                                        </div>
                                        <div >
                                            <Title level={5}>Maximum Participants</Title>
                                            <Text>{participantStats.max_participants_events[0].participant_count} participants</Text>
                                        </div>
                                    </>
                                ) : (
                                    <Text>No data available</Text>
                                )}
                            </Card>
                        </Col>
                        </Row>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col span={24}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card title="Minimum Revenue Event" bordered={false}>
                                {revenueStats?.min_event ? renderBarChart(revenueStats.min_event, "Minimum Revenue Event") : "Loading..."}
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Maximum Revenue Event" bordered={false}>
                                {revenueStats?.max_event ? renderBarChart(revenueStats.max_event, "Maximum Revenue Event") : "Loading..."}
                            </Card>
                        </Col>
                    </Row>
                </Col>
               

            </Row>
            </div>
        </div>
    );
}
