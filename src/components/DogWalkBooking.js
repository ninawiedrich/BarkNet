import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, ListGroup, Form, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { firestore, auth } from '../firebase-config';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WalkerAvailability from './WalkerAvailability'

function DogWalkBooking() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('owner'); // default to 'owner' for testing
  const [dogWalkers, setDogWalkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingRequests, setBookingRequests] = useState({});

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (auth.currentUser) {
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCurrentUser(userSnap.data());
          setUserRole(userSnap.data().roles.includes('walker') ? 'walker' : 'owner');
        }
      }
    };

    fetchCurrentUserProfile();
  }, []);

  useEffect(() => {
    const fetchDogWalkers = async () => {
      const q = query(collection(firestore, 'users'), where('roles', 'array-contains', 'walker'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const walkers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDogWalkers(walkers);
      } else {
        console.log("No walkers found");
      }
    };

    if (userRole === 'owner') {
      fetchDogWalkers();
    }
  }, [userRole]);

  // This function would handle the submission of the walker's availability
  const handleAvailabilitySubmit = async (availabilityData) => {
    // Logic to update the walker's availability in your backend
    console.log('Availability data submitted:', availabilityData);
    // Add your backend update logic here
  };

  const handleBookingRequest = async (walkerId) => {
    const dateTime = new Date(selectedDate);

    const bookingRef = await addDoc(collection(firestore, 'bookings'), {
      walkerId,
      ownerId: currentUser.uid,
      dateTime: dateTime,
      status: 'pending'
    });

    setBookingRequests({
      ...bookingRequests,
      [walkerId]: { dateTime: dateTime, status: 'pending', bookingId: bookingRef.id }
    });
  };

  const renderOwnerInterface = () => (
    <Form>
      <Form.Group controlId="datePicker">
        <Form.Label>Select Date and Time</Form.Label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          timeFormat="HH:mm"
          timeIntervals={60}
          className="form-control"
        />
      </Form.Group>
      <ListGroup className="mt-3">
        {dogWalkers.map(walker => (
          <Card key={walker.id} className="mb-3">
            <Card.Body>
              <Card.Title>{walker.name}</Card.Title>
              <Button
                variant="primary"
                onClick={() => handleBookingRequest(walker.id)}
                disabled={bookingRequests[walker.id]?.status === 'pending'}
              >
                Book a Walk
              </Button>
              {bookingRequests[walker.id] && (
                <div>Status: {bookingRequests[walker.id].status}</div>
              )}
            </Card.Body>
          </Card>
        ))}
      </ListGroup>
    </Form>
  );

  const renderWalkerInterface = () => (
    <div>
      <h3>Set Your Availability</h3>
      {/* Additional form or interface for walker to set availability */}
    </div>
  );

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Dog Need a Walk</h2>
          {currentUser && (
            <ToggleButtonGroup type="radio" name="roleOptions" defaultValue={userRole}>
              <ToggleButton
                id="tbg-radio-1"
                variant="outline-primary"
                value="owner"
                checked={userRole === 'owner'}
                onChange={() => setUserRole('owner')}
              >
                I'm an Owner
              </ToggleButton>
              <ToggleButton
                id="tbg-radio-2"
                variant="outline-primary"
                value="walker"
                checked={userRole === 'walker'}
                onChange={() => setUserRole('walker')}
              >
                I'm a Walker
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          {userRole === 'owner' && renderOwnerInterface()}
          {userRole === 'walker' && <WalkerAvailability onAvailabilitySubmit={handleAvailabilitySubmit} />}
        </Col>
      </Row>
    </Container>
  );
}

export default DogWalkBooking;

