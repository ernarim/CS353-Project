import React, { useState } from "react";
import { Form, Input, InputNumber, Button, Card, Row, Col } from "antd";
import "../style/NewLocationRequestPage.css";
import SeatMatrix from "../components/SeatMatrix";

export const NewLocationRequestPage = () => {
  const [formMeta, formSeat] = Form.useForm();
  const [venueMetaProvided, setVenueMetaProvided] = useState(false); //MAKE IT FALSE
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    // Here you can handle the form submission, send the data to a server, etc.
  };

  const onVenueMetaProvided = (values) => {
    setRows(values.row);
    setColumns(values.column);
    setVenueMetaProvided(true);
  };

  return (
    <Row className="loc-row">
      <Col span={4} className="loc-col">
        <Card
          title="Submit New Venue Name And Location"
          className="loc-col-card"
        >
          <Form
            form={formMeta}
            layout="vertical"
            onFinish={onVenueMetaProvided}
          >
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
              rules={[{ required: true, message: "Please input the street!" }]}
            >
              <Input placeholder="Enter street address" />
            </Form.Item>

            <Form.Item
              name="row"
              label="Row"
              rules={[
                { required: true, message: "Please input the row count!" },
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
                { required: true, message: "Please input the column count!" },
              ]}
            >
              <InputNumber
                placeholder="Enter column count"
                min={1}
                max={200}
                changeOnWheel
              />
            </Form.Item>

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
        className={`${venueMetaProvided ? "loc-col" : "loc-col-transition"}`}
      >
        {venueMetaProvided && (
          <Card title="Selected Seats" className="loc-col-card">
            <SeatMatrix rows={rows} columns={columns} available_seats={[]} />
          </Card>
        )}
      </Col>
    </Row>
  );
};
