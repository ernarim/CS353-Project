import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Modal, Button, Form, Input, Table, message, InputNumber, Upload } from 'antd';
import { HolderOutlined, UploadOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Axios from '../Axios';
import '../style/SeatingPlanCreate.css';

export default function SeatPlanCreate({ venue, getTicketCategories, getSeats, getFileList }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categories, setCategories] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [seatCategories, setSeatCategories] = useState([]);
  const [fileListPlan, setFileListPlan] = useState([]);

  const onChange = ({ fileList }) => {
    setFileListPlan(fileList);
    getFileList(fileList);
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

  useEffect(() => {
    getTicketCategories(categories);
    setCategoryOrder(Object.keys(categories));

    console.log(categories);

    //create seat for each category
    let seatCategories = [];
    Object.keys(categories).forEach((category) => {
      for (let i = 0; i < categories[category].capacity; i++) {
        seatCategories.push(category);
      }
    }
    );
    setSeatCategories(seatCategories);
    getSeats(seatCategories);


  }, [categories]);

  const addCategory = (values) => {
    let { name, color, price, capacity } = values;
    if (color==null || color=='') {
      color = 'black';
    }

    if (totalCapacity + parseInt(capacity, 10) > venue.capacity) {
      message.error('Total capacity exceeds venue capacity');
      return;
    }
    if (categories.hasOwnProperty(name)) {
      message.error('Category name already exists');
      return;
    }
    setCategories(prev => ({
      ...prev,
      [name]: { color, price, capacity: parseInt(capacity, 10) }
    }));
    setTotalCapacity(prev => prev + parseInt(capacity, 10));
    setIsModalVisible(false);
  };

  const updateCategory = (oldName, values) => {
    const { name, color, price, capacity } = values;
    const newCapacity = totalCapacity - categories[oldName].capacity + parseInt(capacity, 10);
    if (newCapacity > venue.capacity) {
      message.error('Total capacity exceeds venue capacity');
      return;
    }
    if (oldName !== name && categories.hasOwnProperty(name)) {
      message.error('Category name already exists');
      return;
    }
    setCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[oldName];
      newCategories[name] = { color, price, capacity: parseInt(values.capacity, 10) };
      return newCategories;
    });
    setTotalCapacity(newCapacity);
    setIsModalVisible(false);
    setEditingCategory(null);
  };

  const deleteCategory = (name) => {
    setCategories(prev => {
      const newCategories = { ...prev };
      setTotalCapacity(prevTotal => prevTotal - newCategories[name].capacity);
      delete newCategories[name];
      return newCategories;
    });
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => setIsModalVisible(false);

  const columns = [
    { key: 'sort', align: 'center', width: 80, render: () => <DragHandle /> },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Price', dataIndex: 'price' },
    {
      title: 'Color',
      dataIndex: 'color',
      render: color => (
        <div style={{ width: '20px', height: '20px', backgroundColor: color, borderRadius: '50%' }}></div>
      )
    },
    { title: 'Capacity', dataIndex: 'capacity' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button style={{marginRight:'10px'}} onClick={() => openModal(record)}>Edit</Button>
          <Button onClick={() => deleteCategory(record.name)} danger>Delete</Button>
        </>
      )
    }
  ];

  const data = categoryOrder.map(name => ({
    key: name,
    name,
    price: categories[name]?.price,
    color: categories[name]?.color,
    capacity: categories[name]?.capacity
  }));

  const RowContext = React.createContext({});

  const DragHandle = () => {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);
    return (
      <Button
        type="text"
        size="small"
        icon={<HolderOutlined />}
        style={{ cursor: 'move' }}
        ref={setActivatorNodeRef}
        {...listeners}
      />
    );
  };

  const Row = (props) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: props['data-row-key'] });

    const style = {
      ...props.style,
      transform: CSS.Translate.toString(transform),
      transition,
      ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    const contextValue = useMemo(
      () => ({ setActivatorNodeRef, listeners }),
      [setActivatorNodeRef, listeners],
    );

    return (
      <RowContext.Provider value={contextValue}>
        <tr {...props} ref={setNodeRef} style={style} {...attributes} />
      </RowContext.Provider>
    );
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      // If over is null, do nothing
      return;
    }
  
    if (active.id !== over.id) {
      setCategoryOrder((prevOrder) => {
        const activeIndex = prevOrder.indexOf(active.id);
        const overIndex = prevOrder.indexOf(over.id);
        return arrayMove(prevOrder, activeIndex, overIndex);
      });
    }
  };

  return (
    <div style={{ userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3>No seating plan is available for this venue</h3>
      <Button onClick={() => openModal()} style={{ marginBottom: '16px' }}>Add Category</Button>

      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext items={categoryOrder} strategy={verticalListSortingStrategy}>
          <Table
            rowKey="key"
            components={{ body: { row: Row } }}
            columns={columns}
            dataSource={data}
            style={{zIndex: 1, width:'100%'}}
          />
        </SortableContext>
      </DndContext>

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          onFinish={editingCategory ? (values) => updateCategory(editingCategory.name, values) : addCategory}
          initialValues={editingCategory || {}}
        >
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Color">
            <Input type="color" />
          </Form.Item>
          <Form.Item 
            name="capacity" 
            label="Capacity" 
            rules={[
              { required: true, message: 'Please input the capacity!' },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingCategory ? "Update Category" : "Add Category"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div className='custom-upload'>
        <Upload
          listType="picture"
          fileList={fileListPlan}
          beforeUpload={() => false} // Allow cropping but prevent actual upload
          onChange={onChange}
          onPreview={onPreview}
        >
          {fileListPlan.length < 1 && <Button style={{marginTop:'15px'}} icon={<UploadOutlined />}>Upload Photo for Seating</Button>}
        </Upload>
      </div>
      
    </div>
  );
}
