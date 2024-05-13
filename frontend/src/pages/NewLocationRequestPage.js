import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Switch, Card, Row, Col } from "antd";
import "../style/NewLocationRequestPage.css";
import SeatMatrix from "../components/SeatMatrix";
import Axios from "../Axios";

export const NewLocationRequestPage = () => {
  const [formMeta] = Form.useForm();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [venueMetaProvided, setVenueMetaProvided] = useState(false); //MAKE IT FALSE
  //const [rows, setRows] = useState(0);
  //const [columns, setColumns] = useState(0);
  const rows = Form.useWatch("row", formMeta);
  const columns = Form.useWatch("column", formMeta);
  const rowColSwitch = Form.useWatch(
    "is_seating_arrangement_provided",
    formMeta
  );

  const getSeats = (seats) => {
    setSelectedSeats(seats);
    console.log("Selected seats: ", seats);
  };

  useEffect(() => {
    console.log("TESTeffect: ", rowColSwitch);
  }, [rowColSwitch]);

  const onFinish = async (values) => {
    console.log("Form values: ", values);
    // Here you can handle the form submission, send the data to a server, etc.
    let data = {};
    data.name = values.name;
    data.city = values.city;
    data.state = values.state;
    data.street = values.street;
    if (values.is_seating_arrangement_provided) {
      data.row_count = values.row;
      data.column_count = values.column;
      data.seats = selectedSeats;
      data.capacity = selectedSeats.length;
    } else {
      data.capacity = values.capacity;
      data.row_count = 0;
      data.column_count = 0;
      data.seats = [];
    }
    console.log("Data: ", data);
    try {
      const response = await Axios.post("/venue", data);
      console.log("Response: ", response);
    } catch (err) {
      console.log(err);
    }
  };

  const onVenueMetaProvided = (values) => {
    //setRows(values.row);
    //setColumns(values.column);
    setVenueMetaProvided(true);
  };

  return (
    <>
      <Row className="loc-row">
        <Col span={4} className="loc-col">
          <Card
            title="Submit New Venue Name And Location"
            className="loc-col-card"
          >
            <Form form={formMeta} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please input the name!" }]}
              >
                <Input placeholder="Enter location name" />
              </Form.Item>

              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: "Please input the city!" }]}
              >
                <Input placeholder="Enter city" />
              </Form.Item>

              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "Please input the state!" }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>

              <Form.Item
                name="street"
                label="Street"
                rules={[
                  { required: true, message: "Please input the street!" },
                ]}
              >
                <Input placeholder="Enter street address" />
              </Form.Item>

              <Form.Item
                name="is_seating_arrangement_provided"
                label="Seating Arrangement Provided"
                rules={[
                  {
                    required: true,
                    message: "Please input the seating arrangement provided!",
                  },
                ]}
              >
                <Switch />
              </Form.Item>

              {rowColSwitch ? (
                <>
                  <Form.Item
                    name="row"
                    label="Row"
                    rules={[
                      {
                        required: true,
                        message: "Please input the row count!",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter row count"
                      min={1}
                      max={200}
                      changeOnWheel
                    />
                  </Form.Item>

                  <Form.Item
                    name="column"
                    label="Column"
                    rules={[
                      {
                        required: true,
                        message: "Please input the column count!",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter column count"
                      min={1}
                      max={200}
                      changeOnWheel
                    />
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item
                    name="capacity"
                    label="Capacity"
                    rules={[
                      {
                        required: true,
                        message: "Please input the capacity!",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter capacity"
                      min={1}
                      max={2000}
                      changeOnWheel
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: "100%" }}
                >
                  Select
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col
          span={20}
          className={`${rowColSwitch ? "loc-col" : "loc-col-transition"}`}
        >
          <Card title="Selected Seats" className="loc-col-card">
            <SeatMatrix
              rows={rows}
              columns={columns}
              available_seats={[]}
              getSeats={getSeats}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};
