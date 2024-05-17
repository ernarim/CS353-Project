import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Axios from '../Axios';
import { Card, Row, Col, Statistic, Typography } from 'antd';

import '../style/admin.css';

const { Title } = Typography;

export function AdminReportPage() {
    const { organizer_id } = useParams();
    const [organizerStats, setOrganizerStats] = useState(null);

    useEffect(() => {
        fetchStatistics(organizer_id);
    }, [organizer_id]);

    const fetchStatistics = async (organizer) => {
        try {
            let response = await Axios.get(`/admin/organizer_info/${organizer_id}`);
            setOrganizerStats(response.data);
        } catch (error) {
            console.error("Failed to fetch organizer statistics", error);
        }
    };

    return (
        <div className="admin-page" style={{padding:'1%', height:'96vh'}}>
            <div className="stat-card">
            <Row gutter={16} > 
                {organizerStats ? (
                        <Col span={24}>
                            <Card>
                                <Statistic
                                    title="Organizer Name"
                                    value={organizerStats.organizer_name}
                                />
                            </Card>
                        </Col>
                        
                    
                ) : (
                    <Col span={24}>
                        <Card loading={true}>Loading...</Card>
                    </Col>
                )}
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

            </div>
            <div>
                
            </div>
        </div>
    );
}
