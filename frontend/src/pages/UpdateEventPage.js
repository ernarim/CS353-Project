import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Switch, InputNumber, Card, Divider, Upload, message } from 'antd';
import Axios from '../Axios';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

const baseURL = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/`;


export function UpdateEventPage ()  {
  const { event_id } = useParams();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [imageFormData, setImageFormData] = useState(new FormData());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await fetchEventDetails();
      await fetchEventCategories();
      await fetchVenues();
    };
    fetchData();
  }, [event_id]);

  useEffect(() => {
    // When eventDetails is updated, set form values
    if (eventDetails) {
      form.setFieldsValue({
        name: eventDetails.name,
        date: moment(eventDetails.date),
        category_id: eventDetails.category.category_id,
        venue_id: eventDetails.venue.venue_id,
        description: eventDetails.description,
        alcohol: eventDetails.restriction.alcohol,
        smoke: eventDetails.restriction.smoke,
        age: eventDetails.restriction.age,
        max_ticket: eventDetails.restriction.max_ticket
      });
      //set file list if photo exists
      if (eventDetails.photo) {
        setFileList([{
          uid: '-1', // Unique identifier
          name: 'Event Image',
          status: 'done',
          url: `${baseURL}static/events/${eventDetails.photo}`
        }]);
      }
      
    }
  }, [eventDetails]);

  const fetchEventDetails = async () => {
    try {
      const response = await Axios.get(`/event/${event_id}`);
      console.log(response.data);
      setEventDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch event details', error);
    }
  };
  const fetchEventCategories = async () => {
    try {
      let response = await Axios.get('/event_category');
      console.log('Event Categories', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch event categories', error);
    }
  };

  const fetchVenues = async () => {
    try {
      let response = await Axios.get('/venue');
      console.log('Venues', response.data);
      setVenues(response.data);
    } catch (error) {
      console.error('Failed to fetch venues', error);
    }
  };



  const handleSubmit = async (values) => {
    values.organizer_id = localStorage.getItem('userId');
    if (values.date) {
      values.date = values.date.format('YYYY-MM-DD HH:mm:ss'); // Formatting the date
    }
  
    // Handle photo upload if a new photo was added
    let filename;
    
    if (fileList.length > 0 && fileList[0].originFileObj) {
      filename = await handlePhotoUpload();
      values.photo = filename;
    } else {
      console.log("No file selected for upload.");
      values.photo = null;
    }
  
    // Restriction data as a nested object
    values.restriction = {
      alcohol: values.alcohol,
      smoke: values.smoke,
      age: values.age,
      max_ticket: values.max_ticket,
    };
  
    // Clean up form values to match the API expectations
    delete values.alcohol;
    delete values.smoke;
    delete values.age;
    delete values.max_ticket;
  
    console.log('Received values of form: ', values);


    try {
      const response = await Axios.patch(`/event/${event_id}`, values);
      message.success('Event updated successfully');
      navigate(`/event_detail/${event_id}`);

    } catch (error) {
      console.error('Failed to update event', error);
      message.error('Failed to update event');
    }
 
    
  };


  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    console.log(newFileList);
   
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const handlePhotoUpload = async () => {
    
    if (fileList.length === 0) {
        console.log("No file selected for upload.");
        return;
    }
    console.log('File List', fileList);
    // Appending the file to formData
    imageFormData.append('photo', fileList[0].originFileObj, fileList[0].name);
    
    try{
      let result = await Axios.post('/event/upload_photo', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      let filename = result.data.filename;
      return filename;
    }
    catch(error){
      console.log(error);
    }

};

  


return (
    <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
      <Card title={<div style={{ textAlign: 'center' }}>Edit Event</div>} style={{width:600, margin:20}} >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item label="Event Title" name="name" rules={[{ required: true, message: 'Please input event name!' }]}>
            <Input placeholder="Enter event title" />
          </Form.Item>
          <Form.Item label="Date / Time" name="date" rules={[{ required: true, message: 'Please input event date!' }]}>
            <DatePicker showTime placeholder="Select time" />
          </Form.Item>
          <Form.Item label="Category" name="category_id">
            <Select placeholder="Select a category">
              {categories.map((category) => (
                <Select.Option key={category.category_id} value={category.category_id}>{category.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Venue" name="venue_id">
            <Select placeholder="Select a venue">
              {venues.map((venue) => (
                <Select.Option key={venue.venue_id} value={venue.venue_id}>{venue.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Enter event description" />
          </Form.Item>
          <Form.Item label="Upload Photo" name="photo">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={onChange}
              onPreview={onPreview}
              
            >
              {fileList.length < 1 && '+ Upload'}
            </Upload>
          </Form.Item>
          <Divider>Restrictions</Divider>
          <Form.Item label="Smoke" name="smoke">
            <Switch />
          </Form.Item>
          <Form.Item label="Alcohol" name="alcohol">
            <Switch />
          </Form.Item>
          <Form.Item label="Age (from)" name="age">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item label="Max Ticket Purchase" name="max_ticket">
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Event
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

