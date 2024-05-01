import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Switch, InputNumber, Card, Divider, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import Axios from '../Axios';

const baseURL = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/`;


export function CreateNewEventPage ()  {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    fetchEventCategories();
    fetchVenues();
  }, []);


  const handleSubmit = async (values) => {
    values.organizer_id = localStorage.getItem('userId');
    if (values.date) {
      values.date = values.date.format('YYYY-MM-DD HH:mm:ss');
    }
    let filename = await handlePhotoUpload();
    values.photo = filename;
    values.restriction = {};
    values.restriction.alcohol = values.alcohol;
    values.restriction.smoke = values.smoke;
    values.restriction.age = values.age;
    values.restriction.max_ticket = values.max_ticket;
  
    delete values.alcohol;
    delete values.smoke;
    delete values.age;
    delete values.max_ticket;
  
    console.log('Received values of form: ', values);
    
    try{
      Axios.post('/event', values);
    }
    catch(error){
      console.log(error);
    }

    
  };

  const [fileList, setFileList] = useState([]);

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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
    const formData = new FormData();
    if (fileList.length === 0) {
        console.log("No file selected for upload.");
        return;
    }
    // Appending the file to formData
    formData.append('photo', fileList[0].originFileObj, fileList[0].name);

    try{
      let result = await Axios.post('/event/upload_photo', formData, {
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
      <Card title={<div style={{ textAlign: 'center' }}>Create New Event</div>}style={{width:600, margin:20}} >
      <Form onFinish={handleSubmit}>

        <Form.Item label="Event Title" name="name" rules={[{ required: true, message: 'Please input event name!'  }]}>
          <Input placeholder="Enter event title" />
        </Form.Item>
        <Form.Item label="Date / Time" name="date" rules={[{ required: true, message: 'Please input event date!' }]}>
          <DatePicker showTime placeholder="Select time" />
        </Form.Item>
        <Form.Item label="Category" name="category_id" rules={[{ required: false, message: 'Please input event category!' }]}>
          <Select placeholder="Select a category">
            {categories.map((category) => (
              <Select.Option key={category.category_id} value={category.category_id}>{category.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Venue" name="venue_id" rules={[{ required: false }]}>
          <Select placeholder="Select a venue">
            {venues.map((venue) => (
              <Select.Option key={venue.venue_id} value={venue.venue_id}>{venue.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Description" name="description" rules={[{ required: false }]}>
          <Input.TextArea placeholder="Enter event description" />
        </Form.Item>
        <Form.Item label="Upload Photo" name="photo">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false} // Allow cropping but prevent actual upload

            onChange={onChange}
            onPreview={onPreview}
          >
            {fileList.length < 1 && '+ Upload'}
          </Upload>
          
        
      </Form.Item>
        <Divider >Restrictions</Divider>
        <Form.Item label="Smoke" name="smoke">
          <Switch  />
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
            Publish Event
          </Button>
        </Form.Item>
      </Form>
      </Card>
    </div>

  );
};

