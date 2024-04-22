import {Button, Card, Carousel, Col, Row, Select} from "antd";
import Search from "antd/lib/input/Search";
import React, {useContext} from "react";
import {ConfigContext} from "antd/lib/config-provider";
import {Theme} from "../style/theme";

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
    const categories = [
        { name: 'Category 1' },
        { name: 'Category 2' },
        { name: 'Category 3' },
        { name: 'Category 4' },
        { name: 'Category 5' },
        { name: 'Category 6' },
    ];

    const events = [
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

    return (
        <div className="site-layout-content">


               <Carousel autoplay style={carouselStyle}>
                   <div>
                       <div style={contentStyle}>1</div>
                   </div>
                   <div>
                       <div style={contentStyle}>1</div>
                   </div>
                   <div>
                       <div style={contentStyle}>1</div>
                   </div>
               </Carousel>


            <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                {/* Search bar */}
                <div className="search-bar" style={searchBarStyle}>
                    <Search placeholder="Search event" loading={false} onSearch={value => console.log(value)} style={{ width: 200 }} />
                    <Select defaultValue="Indonesia" style={{ width: 120 }} onChange={value => console.log(value)}>
                        {/* Options for places */}
                    </Select>
                    <Select defaultValue="Any date" style={{ width: 120 }} onChange={value => console.log(value)}>
                        {/* Options for dates */}
                    </Select>
                    <Button type="primary">Search</Button>
                </div>

                <Row gutter={50} style={{margin:'50px 0px'}}>
                    {categories.map((category, index) => (
                        <Col key={index} xs={12} sm={8} md={6} lg={4} style={{textAlign:'center'}}>
                            <Card hoverable style={{ textAlign: 'center', backgroundColor: 'black' , height: 100, width: 100, borderRadius: '50%' }}>
                                <div style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* You can place an image or icon here */}
                                </div>

                            </Card>
                            <p>{category.name}</p>
                        </Col>
                    ))}
                </Row>


                {/* Event List */}
                <Row gutter={16}>
                    {events.map(event => (
                        <Col span={8} key={event.id}>
                            <Card
                                hoverable
                                cover={<img alt={event.title} src={event.image} />}
                            >
                                <Card.Meta title={event.title} description={event.date} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>


        </div>

    );
}