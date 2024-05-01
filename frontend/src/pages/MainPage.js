import {Button, Card, Carousel, Col, Divider, Row, Select, DatePicker} from "antd";
import Search from "antd/lib/input/Search";
import { useNavigate } from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import {Theme} from "../style/theme";
import Axios from "../Axios";
import turkishCities from '../data/cities.json';


const baseURLCategory = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/event_categories/`;
const baseURLEvents = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/static/events/`;
const {colors, font} = Theme;

const carouselStyle = {
    borderRadius:'10px',
    padding:'0px',
    margin:'0px',
    width: '100%',
    height: '300px',
    zIndex:'1'
}

const contentStyle = {

    color: '#fff',
    lineHeight: '350px',
    textAlign: 'center',
    background: '#364d79',
};


const searchBarStyle = {
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',

    background: 'black',
    height:'100px',
    width:'800px',
    borderRadius: '10px',
    zIndex: '2',
    gap:'15px'

}
export function MainPage (){
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [eventCategories, setEventCategories] = useState([]);
    const [carouselEvents, setCarouselEvents] = useState([]);

    eventCategories.forEach(category => {
        category.image = `${baseURLCategory}${category.name}.png`;
    });
    console.log(eventCategories);   



    const categories = [
        { name: 'Category 1' },
        { name: 'Category 2' },
        { name: 'Category 3' },
        { name: 'Category 4' },
        { name: 'Category 5' },
        { name: 'Category 6' },
    ];

    const eventss = [
        {
            id: 1,
            title: 'Wonder Girls 2010 Wonder Girls World Tour San Francisco',
            description: 'Get your directly seated and inside for you to enjoy the show.',
            image: '',
            date: '2024-08-14'
        },
        {
            id: 2,
            title: 'JYJ 2011 JYJ Worldwide Concert Barcelona',
            description: 'Directly seated and inside for you to enjoy the show.',
            image: '',
            date: '2024-08-20'
        },
        {
            id: 3,
            title: 'Super Junior SM Town Live \'10 World Tour New York City',
            description: 'Directly seated and inside for you to enjoy the show.',
            image: '',
            date: '2024-09-18'
        },
        // Add more events as needed
    ];


    const fetchEvents = async () => {
        // Fetch events from the backend
        try {
            const response = await Axios.get('/event');
            console.log('Fetched events', response.data);
            setEvents(response.data);
        }
        catch (error) {
            console.error('Failed to fetch events', error);
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
        }
    }

    const getRandomEvents = (events, count) => {
        let shuffled = events.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    

    useEffect(() => {
        fetchEvents();
        fetchEventCategories();
    }, []);

    useEffect(() => {
        if (events.length > 0) {
            setCarouselEvents(getRandomEvents(events, 3));
        }
    }, [events]); 
    
    return (
        <div className="site-layout-content" style={{marginBottom:'3%'}}>


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


            <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                {/* Search bar */}
                <div className="search-bar" style={searchBarStyle}>
                    <Search placeholder="Search event" loading={false} onSearch={value => console.log(value)} style={{ width: 200 }} />
                    <Select placeholder="Select a city" style={{ width: 120 }} onChange={value => console.log(value)}>
                        {turkishCities.map(city => (
                            <Select.Option key={city.id} value={city.name}>{city.name}</Select.Option>
                        ))}
                    </Select>
                    <DatePicker.RangePicker
                        style={{ width: 240 }}
                        onChange={dates => console.log(dates)}
                    />
                    <Button type="primary">Search</Button>
                </div>

                <Row gutter={50} style={{margin:'50px 0px', justifyContent:'center'}}>
                    {eventCategories.map((category, index) => (
                        <Col key={index} xs={12} sm={8} md={6} lg={3} style={{textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', width:180}}>
                                <img 
                                    src={category.image} 
                                    alt={category.name} 
                                    style={{ 
                                        width: '100%',  // Set width to 100% to fill the card horizontally
                                        height: 'auto', // Maintain aspect ratio
                                        borderRadius: '50%', // Make the image circular
                                        border: '2px solid ',
                                    }} 
                                />
                            

                            <p>{category.name}</p>
                        </Col>
                    ))}
                </Row>


                {/* Event List */}
                <Row gutter={[20,30]} style={{margin:'0px 5%'}}>
                    {events.map(event => (
                        <Col span={6} key={event.event_id}>
                            <Card
                                onClick={()=> navigate(`/event_detail/${event.event_id}`)}
                                hoverable
                                style={{
                                    minHeight: '280px', // Ensures all cards have at least this height
                                }}
                                cover={
                                    <>
                                        <img
                                            alt={event.name}
                                            src={baseURLEvents + event.photo}
                                            style={{
                                                width: '100%',        // Ensures the image takes the full width of the card
                                                height: '350px',      // Fixed height for all images
                                                objectFit: 'contain'    // Ensures the image covers the area without distorting the aspect ratio
                                            }}
                                        />
                                        <Divider style={{marginBottom:'0px'}}/>
                                    </>
                                }
                               
                            >
                                <Card.Meta title={event.name} description={event.date} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>


        </div>

    );
}