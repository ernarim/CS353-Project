import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, Modal, Switch, InputNumber, Card, Divider, Upload, message } from 'antd';
import Axios from '../Axios';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

const baseURL = `${window.location.protocol}//${window.location.hostname}${process.env.REACT_APP_API_URL}/`;


export function UpdateEventPage ()  {
  const { event_id } = useParams();
  const [form] = Form.useForm();
  
  const [ticketCategories, setTicketCategories] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [imageFormData, setImageFormData] = useState(new FormData());
  const navigate = useNavigate();
  let filename;

  useEffect(() => {
    const fetchData = async () => {
      await fetchEventDetails();
      await fetchTicketCategories();
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
        filename = eventDetails.photo;
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

  const fetchTicketCategories = async () => {
    try {
      let response = await Axios.get(`/ticket_category/${event_id}`);
      console.log('Event Categories', response.data);
      setTicketCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch event categories', error);
    }
  };


  const handleSubmit = async (values) => {
    values.organizer_id = localStorage.getItem('userId');
    
  
    // Handle photo upload if a new photo was added
    console.log('File List', fileList);
    
    if (fileList.length > 0 && fileList[0].originFileObj) {
      filename = await handlePhotoUpload();
      values.photo = filename;
      console.log('Filename', filename);
    } else {
      console.log("No file selected for upload.");
      values.photo = eventDetails.photo;
    }
  
  
    console.log('Received values of form: ', values);
    try {
      const response = await Axios.patch(`/event/${event_id}`, values);

    } catch (error) {
      console.error('Failed to update event', error);
      message.error('Failed to update event');
    }
 
    try {
      console.log('Ticket Categories', ticketCategories);
      const response = await Axios.patch(`/ticket_category/${event_id}`, ticketCategories);
    }
    catch (error) {
      console.error('Failed to update ticket categories', error);
      message.error('Failed to update ticket categories');
    }
    message.success('Event updated successfully');
    //navigate(`/event_detail/${event_id}`);


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



const columns = [
  {
    title: "Category",
    dataIndex: "category_name",
    key: "category_name",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Color",
    dataIndex: "color",
    key: "color",
    render: (color) => (
      <div style={{
        width: "20px", 
        height: "20px",
        backgroundColor: color, 
        borderRadius: "50%",
      }}/>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Button type='primary' onClick={() => showModal(record)}>
        Edit
      </Button>
    ),
  },
  
  
];

const [isModalVisible, setIsModalVisible] = useState(false);
const [editingCategory, setEditingCategory] = useState(null);

const showModal = (record) => {
  form.setFieldsValue({
    price: record.price,
    color: record.color,
  });
  setEditingCategory(record);
  setIsModalVisible(true);
};

const handleOk = async () => {
  try {
    const values = await form.validateFields();
    const updatedCategories = ticketCategories.map(cat =>
      cat.key === editingCategory.key ? { ...cat, ...values } : cat
    );

    setTicketCategories(updatedCategories);
    setIsModalVisible(false);
  } catch (errorInfo) {
    console.log('Failed:', errorInfo);
  }
};

const handleCancel = () => {
  setIsModalVisible(false);
};

return (
    <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
      <Card title={<div style={{ textAlign: 'center' }}>Edit Event</div>} style={{width:600, margin:20}} >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item label="Event Title" name="name" rules={[{ required: true, message: 'Please input event name!' }]}>
            <Input placeholder="Enter event title" />
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
          <Divider>Ticket Categories</Divider>
          <Table dataSource={ticketCategories} columns={columns} pagination={false}  />

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{position:'absolute', width:'100%'}}>
              Update Event
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Modal title="Edit Ticket Category" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please input the price!' }]}>
            <InputNumber />
          </Form.Item>
          <Form.Item name="color" label="Color" rules={[{ required: true, message: 'Please input the color!' }]}>
            <input type="color" className="ant-input" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

