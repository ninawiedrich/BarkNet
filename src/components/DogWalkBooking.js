import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, ListGroup, Form } from 'react-bootstrap';
import { firestore } from '../firebase-config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

function DogWalkBooking() {
  const [dogWalkers, setDogWalkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(""); // Store date as string
  const [selectedTime, setSelectedTime] = useState("09:00"); // Default to 9:00 AM

  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [bookingRequests, setBookingRequests] = useState({});

  // Times for the time selector
  const times = Array.from({ length: 24 }, (_, index) => {
    const hour = index < 10 ? `0${index}` : index;
    return `${hour}:00`;
  });

  useEffect(() => {
    const fetchDogWalkers = async () => {
      const q = query(collection(firestore, 'users'), where('roles', 'array-contains', 'walker'));
      const querySnapshot = await getDocs(q);
      const walkers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDogWalkers(walkers);
    };

    fetchDogWalkers();
  }, []);

  const handleBookingRequest = async (walkerId) => {
    const bookingRef = await addDoc(collection(firestore, 'bookings'), {
      walkerId,
      ownerId: 'currentUserId', // Replace with current user's ID
      dateTime: selectedDate,
      status: 'pending'
    });

    setBookingRequests({
      ...bookingRequests,
      [walkerId]: { dateTime: selectedDate, status: 'pending', bookingId: bookingRef.id }
    });
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Dog Need a Walk</h2>
          <Form>
            <Form.Group as={Row} controlId="dateControl">
              <Form.Label column sm="3">Select Date</Form.Label>
              <Col sm="9">
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="timeControl" className="mt-3">
              <Form.Label column sm="3">Select Time</Form.Label>
              <Col sm="9">
                <Form.Select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  {times.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default DogWalkBooking;

