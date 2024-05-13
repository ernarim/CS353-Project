import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Input, Select, Col, Row, Checkbox, Divider } from 'antd';
import SeatHeader from "./SeatHeader";
import SeatCreate from "./SeatCreate";



export default function SeatMatrixCreate({ venue, getTicketCategories, getSeats}) {


  const [selectedSeats, setSelectedSeats] = useState([]);
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const [categories, setCategories] = useState({
  });
  const [currentCategory, setCurrentCategory] = useState();
  const [seatCategories, setSeatCategories] = useState([]);
  const [cannotSellSeats, setCannotSellSeats] = useState(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);

  const addCategory = (values) => {
    const { name, color, price } = values;
    setCategories(prev => ({
      ...prev,
      [name]: { color, price }
    }));
    setIsModalVisible(false);
  };

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);




  const assignCategoryToSelectedSeats = () => {
    const updatedCategories = { ...seatCategories };
    const newCannotSellSeats = new Set(cannotSellSeats);
  
    selectedSeats.forEach(([row, col]) => {
      const key = `${row}-${col}`;
      updatedCategories[key] = currentCategory;
      if (newCannotSellSeats.has(key)) {
        newCannotSellSeats.delete(key);
      }
    });
    setCannotSellSeats(newCannotSellSeats);
    setSeatCategories(updatedCategories);

    resetSelections();
  };
  
  
  const toggleCannotSell = () => {
    const newCannotSellSeats = new Set(cannotSellSeats);
    const updatedCategories = { ...seatCategories };
  
    selectedSeats.forEach(([row, col]) => {
      const key = `${row}-${col}`;
      if (newCannotSellSeats.has(key)) {
        newCannotSellSeats.delete(key);
      } else {
        newCannotSellSeats.add(key);
        delete updatedCategories[key]; // Remove the seat from any category
      }
    });
  
    setSeatCategories(updatedCategories);
    setCannotSellSeats(newCannotSellSeats);
    resetSelections();
  };
  
  
  useEffect(() => {
    if (venue) {
      setRows(venue.row_count);
      setColumns(venue.column_count);
    }
    const initialCannotSellSeats = new Set();
    for (let r = 1; r <= venue.row_count; r++) {
      for (let c = 1; c <= venue.column_count; c++) {
        initialCannotSellSeats.add(`${r}-${c}`);
      }
    }
    setCannotSellSeats(initialCannotSellSeats);
  }, [venue]);

  useEffect(() => {
    getSeats(seatCategories);
    getTicketCategories(categories);
    console.log("seatCategories", seatCategories);
    console.log("cannotSellSeats", cannotSellSeats);
  }, [cannotSellSeats, seatCategories]);

  const toggleSeatSelection = (seatNumber) => {
    const [row, col] = seatNumber.split('-').map(Number);
    const index = selectedSeats.findIndex(seat => seat[0] === row && seat[1] === col);
    if (index >= 0) {
      setSelectedSeats(current => current.filter((_, i) => i !== index));
    } else {
      setSelectedSeats(current => [...current, [row, col]]);
    }
  };

  const handleMouseDown = (row, column) => {
    setIsDragging(true);
    setDragStart({ row, column });
    const seatNumber = `${row}-${column}`;
  };

  const handleMouseOver = (row, column) => {
    if (isDragging && dragStart) {
      const rowStart = Math.min(dragStart.row, row);
      const rowEnd = Math.max(dragStart.row, row);
      const columnStart = Math.min(dragStart.column, column);
      const columnEnd = Math.max(dragStart.column, column);
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = columnStart; c <= columnEnd; c++) {
          const seatNumber = `${r}-${c}`;
          if (!selectedSeats.some(seat => seat[0] === r && seat[1] === c)) {
            setSelectedSeats(current => [...current, [r, c]]);
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const resetSelections = () => {
    setSelectedSeats([]);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  const onSelectChange =  async (value) => {
    console.log(`selected ${value}`);
    setCurrentCategory(value);
    if(value == currentCategory){
      assignCategoryToSelectedSeats();
    }


  }

  useEffect(() => {
    if (currentCategory) {
      assignCategoryToSelectedSeats();
    }
  }, [currentCategory]); 


  function CategorySelector({ categories, currentCategory, setCurrentCategory }) {
    return (
        <Select 
            defaultValue={currentCategory}
            style={{ width: 200 }}
            onSelect={ onSelectChange}
            
            
        >
            {Object.keys(categories).map(cat => (
                <Select.Option key={cat} value={cat} >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            backgroundColor: categories[cat].color,
                            marginRight: '8px',
                            borderRadius: '50%'
                        }}></span>
                        <div style={{marginRight:'8px'}}>{categories[cat].price + " TL"}</div>

                        {cat}
                    </div>
                    
                </Select.Option>
            ))}
        </Select>
    );
}



  return (
    <div onMouseUp={handleMouseUp} style={{ userSelect: 'none', display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div>
        <Button onClick={openModal} style={{marginRight:'8px'}}>Add Category</Button>
        <CategorySelector 
              categories={categories}
              currentCategory={currentCategory}
              setCurrentCategory={setCurrentCategory}
          />
        
      </div>

      <Divider style={{margin:'15px 0px'}} />
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Row key={rowIndex} style={{ marginBottom: 5 }} gutter={[8, 8]}>
          {Array.from({ length: columns }, (_, colIndex) => {
            const row = rowIndex + 1;
            const column = colIndex + 1;
            const seatKey = `${row}-${column}`;
            const isSelected = selectedSeats.some(([r, c]) => r === row && c === column);
            const isCannotSell = cannotSellSeats.has(seatKey);
            let seatColor = isCannotSell ? '#cccccc' : categories[seatCategories[seatKey]]?.color || '#cccccc';
            if(isSelected) seatColor = 'rgba(69,69,69,1)';
            return (
              <Col key={colIndex}
                   onMouseDown={() => handleMouseDown(row, column)}
                   onMouseOver={() => handleMouseOver(row, column)}>
                <SeatCreate
                  number={seatKey}
                  color={seatColor}
                  onSeatClick={toggleSeatSelection}
                />
              </Col>
            );
          })}
        </Row>
      ))}
      <Divider style={{margin:'15px 0px'}} />

      <div>
        <Button onClick={toggleCannotSell} style={{ backgroundColor: '#cccccc', color: 'white', marginRight:'8px'  }}>Toggle Cannot Sell</Button>
        <Button style={{marginRight:'8px'}} onClick={resetSelections}>Reset Selections</Button>
      </div>
      <Modal title="Add Category" visible={isModalVisible} onCancel={closeModal} footer={null}>
        <Form onFinish={addCategory}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Color" rules={[{ required: true }]}>
            <Input type="color" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add Category</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
  
}
