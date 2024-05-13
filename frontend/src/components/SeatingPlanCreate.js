import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Modal, Button, Form, Input, Table, message, InputNumber } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Axios from '../Axios';

export default function SeatPlanCreate({ venue, getTicketCategories, getSeats }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categories, setCategories] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [categoryOrder, setCategoryOrder] = useState([]);

  useEffect(() => {
    getTicketCategories(categories);
    setCategoryOrder(Object.keys(categories));
  }, [categories]);

  const addCategory = (values) => {
    const { name, color, price, capacity } = values;
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
          <Button onClick={() => openModal(record)}>Edit</Button>
          <Button onClick={() => deleteCategory(record.name)} danger>Delete</Button>
        </>
      )
    }
  ];

  const data = categoryOrder.map(name => ({
    key: name,
    name,
    price: categories[name].price,
    color: categories[name].color,
    capacity: categories[name].capacity
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
    if (active.id !== over?.id) {
      setCategoryOrder((prevOrder) => {
        const activeIndex = prevOrder.indexOf(active.id);
        const overIndex = prevOrder.indexOf(over.id);
        return arrayMove(prevOrder, activeIndex, overIndex);
      });
    }
  };

  return (
    <div style={{ userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button onClick={() => openModal()} style={{ marginBottom: '16px' }}>Add Category</Button>

      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext items={categoryOrder} strategy={verticalListSortingStrategy}>
          <Table
            rowKey="key"
            components={{ body: { row: Row } }}
            columns={columns}
            dataSource={data}
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
          <Form.Item name="color" label="Color" rules={[{ required: true }]}>
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
    </div>
  );
}
