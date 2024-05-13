import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Switch, Card, Row, Col } from "antd";
import "../style/NewLocationRequestPage.css";
import SeatMatrix from "../components/SeatMatrix";
import Axios from "../Axios";
import { message } from "antd";

export const NewLocationRequestPage = () => {
  const [formMeta] = Form.useForm();
  const [selectedSeats, setSelectedSeats] = useState([]);

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
    data.requester_id = localStorage.getItem("userId");
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

    if(data.capacity === 0) {
      message.error("Please select a valid capacity!");
      return;
    }
    try {
      const response = await Axios.post("/venue", data);
      console.log("Response: ", response); //TEST
      if (response.status === 201) {
        message.success("Venue request created successfully!");
        formMeta.resetFields();
      }
    } catch (err) {
      message.error("Failed to create venue request!");
      console.log(err);
    }
  };

  return (
    <>
      <Row className="loc-row" justify={"center"}>
        <Col span={6} className="loc-col">
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
          className={`${rowColSwitch ? "loc-col" : "loc-col-transition"}`}
          flex={`${rowColSwitch ? 18 : 0}`}
        >
          <Card title="Selected Seats" className="loc-col-card">
            <SeatMatrix
              rows={rows}
              columns={columns}
              available_seats={[]}
              getSeats={getSeats}
              header={[false, false, true, true]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};
