import { Button, Card, Carousel, Col, Divider, Row, Select, DatePicker, Input } from "antd";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Axios from "../Axios";
import turkishCities from '../data/cities.json';
import moment from 'moment';

const { RangePicker } = DatePicker;

const baseURLCategory = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/event_categories/`;
const baseURLEvents = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/events/`;

const carouselStyle = {
    borderRadius: '10px',
    padding: '0px',
    margin: '0px',
    width: '100%',
    height: '310px',
    zIndex: '1',
}

const contentStyle = {
    color: '#fff',
    lineHeight: '350px',
    textAlign: 'center',
    background: '#364d79',
    borderBottom: '2px solid #364d79',
};

const searchBarStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5,25,35,0.9)',
    height: '80px',
    width: '750px',
    borderRadius: '10px',
    zIndex: '2',
    gap: '15px',
    padding:'0px 10px'
}

export function MainPage() {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [eventCategories, setEventCategories] = useState([]);
    const [carouselEvents, setCarouselEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

    const clearSelection = () => {
        setSelectedCity(undefined);  // Resets the selection
      };
    eventCategories.forEach(category => {
        category.image = `${baseURLCategory}${category.name}.png`;
    });

    const fetchEvents = async (params = {}) => {
        // Fetch events from the backend with the given params
        try {
            const response = await Axios.get('/event', { params });
            console.log('Fetched events', response.data);
            setEvents(response.data);
        }
        catch (error) {
            console.error('Failed to fetch events', error);
            setEvents([]); // Ensure events is never null
        }
    }

    const fetchEventCategories = async () => {
        try {
            const response = await Axios.get('/event_category');
            console.log('Fetched event categories', response.data);
            setEventCategories(response.data);
        }
        catch (error) {
            console.error('Failed to fetch event categories', error);
            setEventCategories([]); // Ensure eventCategories is never null
        }
    }

    const getRandomEvents = (events, count) => {
        if (!events || events.length === 0) return []; // Check for null or empty array
        let shuffled = events.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    const handleSearch = (categoryName = selectedCategory) => {
        const params = {};
        if (searchTerm) params.name = searchTerm;
        if (selectedCity) params.city = selectedCity;
        if (dateRange.length === 2) {
            params.start_date = dateRange[0].toISOString();
            params.end_date = dateRange[1].toISOString();
        }
        if (categoryName) params.category_name = categoryName;
        fetchEvents(params);
    }

    const handleCategoryClick = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory('');
            handleSearch(''); // Fetch all events if category is unselected
        } else {
            setSelectedCategory(category);
            handleSearch(category);
        }
    }

    useEffect(() => {
        fetchEvents();
        fetchEventCategories();
    }, []);

    useEffect(() => {
        if (events.length > 0) {
            setCarouselEvents(getRandomEvents(events, 3));
        } else {
            setCarouselEvents([]); // Ensure carouselEvents is never null
        }
    }, [events]);

    return (
        <div className="site-layout-content" style={{ marginBottom: '3%' }}>

            <Carousel autoplay style={carouselStyle}>
                {carouselEvents.map((event, index) => (
                    <div key={index}>
                        <div style={contentStyle}>
                            <img
                                src={baseURLEvents + event.photo}
                                alt={event.title}
                                style={{
                                    width: '100%',
                                    height: '350px',
                                    objectFit: 'cover'
                                }}
                            />
                            <h3 style={{ color: '#fff', position: 'absolute', bottom: 10, left: 10 }}>
                                {event.title}
                            </h3>
                        </div>
                    </div>
                ))}
            </Carousel>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Search bar */}
                <div className="search-bar" style={searchBarStyle}>
                    <Input
                        placeholder="Search event"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: 200 }}
                    />
                    
                    <Select
                        placeholder="Select a city"
                        style={{ width: 120 }}
                        onChange={setSelectedCity} 
                        value={selectedCity}     
                        allowClear                 
                    >
                        {turkishCities.map(city => (
                        <Select.Option key={city.id} value={city.name}>{city.name}</Select.Option>
                        ))}
                    </Select>
                    <RangePicker
                        style={{ width: 240 }}
                        onChange={dates => setDateRange(dates)}
                    />
                    <Button type="primary" onClick={() => handleSearch(selectedCategory)}>Search</Button>
                </div>

                <Row gutter={50} style={{ margin: '50px 0px', justifyContent: 'center' }}>
                    {eventCategories.map((category, index) => (
                        <Col
                            key={index}
                            xs={5} sm={4} md={3} lg={2}
                            style={{
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: 180,
                                cursor: 'pointer',
                                backgroundColor: selectedCategory === category.name ? 'rgba(173, 216, 230, 0.5)' : 'transparent',
                                transition: 'background-color 0.3s ease',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            onClick={() => handleCategoryClick(category.name)}
                        >
                            <img
                                src={category.image}
                                alt={category.name}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '50%',
                                    border: selectedCategory === category.name ? '2px solid #0056b3' : '2px solid black',
                                    transition: 'border 0.3s ease'
                                }}
                            />
                            <p>{category.name}</p>
                        </Col>
                    ))}
                </Row>

                {/* Event List */}
                <Row gutter={[20, 30]} style={{ margin: '0px 4%' }}>
                    {events.length > 0 ? (
                        events.map(event => (
                            <Col span={8} key={event.event_id}>
                                <Card
                                    onClick={() => navigate(`/event/${event.event_id}`)}
                                    hoverable
                                    style={{
                                        minHeight: '280px',
                                        minWidth: '280px',
                                    }}
                                    cover={
                                        <>
                                            <img
                                                alt={event.name}
                                                src={baseURLEvents + event.photo}
                                                style={{
                                                    width: '100%',
                                                    height: '350px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                            <Divider style={{ marginBottom: '0px' }} />
                                        </>
                                    }
                                >
                                    <Card.Meta title={event.name} description={moment ? moment(event.date).format('DD/MM/YYYY HH:mm') : event.date} />
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <h2>No events found</h2>
                    )}
                </Row>
            </div>

        </div>
    );
}
