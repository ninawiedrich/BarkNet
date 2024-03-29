import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import SignIn from './components/SignIn';
import Home from './components/Home';
import SignUp from './components/SignUp';
import UserProfile from './components/UserProfile';
import SharedPosts from './components/SharedPosts';
import DogWalkBooking from './components/DogWalkBooking';

import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">BarkNet</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/user-profile">Profile</Nav.Link>
              <Nav.Link as={Link} to="/shared-posts">Posts</Nav.Link>
              <Nav.Link as={Link} to="/dog-walk-booking">Dog Need a Walk</Nav.Link>

              {/* Add other nav links as needed */}
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/messenger">
                Messages <Badge bg="light" text="dark">4</Badge>
              </Nav.Link>
              <Nav.Link as={Link} to="/signin">Sign In</Nav.Link>
              <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
              {/* Add other nav links as needed */}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/user-profile/:userId" element={<UserProfile />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/shared-posts" element={<SharedPosts />} />
          <Route path="/dog-walk-booking" element={<DogWalkBooking />} />

          {/* Add other routes as needed */}
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
