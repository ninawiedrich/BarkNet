import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const WalkerAvailability = ({ onAvailabilitySubmit }) => {
  // Initialize the state for availability dates
  const [availabilityRange, setAvailabilityRange] = useState({
    startDate: new Date(), // Default start date is today
    endDate: new Date(), // Default end date is also today
  });

  // Handle the change of the date picker for start and end dates
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setAvailabilityRange({ startDate: start, endDate: end });
  };

  // When the form is submitted, call the onAvailabilitySubmit function prop
  const handleSubmit = (event) => {
    event.preventDefault();
    onAvailabilitySubmit(availabilityRange);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group as={Row} controlId="availabilityRange">
        <Form.Label column sm={3}>Availability Range</Form.Label>
        <Col sm={9}>
          <DatePicker
            selectsRange={true}
            startDate={availabilityRange.startDate}
            endDate={availabilityRange.endDate}
            onChange={handleDateChange}
            inline
          />
        </Col>
      </Form.Group>
      <Button type="submit" variant="primary" className="mt-3">Set Availability</Button>
    </Form>
  );
};

export default WalkerAvailability;
