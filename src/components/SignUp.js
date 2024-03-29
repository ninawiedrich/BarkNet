import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import '../App.css';

const sharedCardStyle = {
  maxWidth: '500px',
  width: '100%',
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  border: '4px solid white',
  borderRadius: '0.25rem',
  padding: '2rem',
  margin: 'auto',
  color: '#000',
};

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) && /\W/.test(password);
  };

  const register = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long, include an uppercase letter, a number, and a symbol.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/user-profile'); // or wherever you'd like to direct the user after sign up
    } catch (error) {
      setError('Failed to create an account. Please check your details and try again.');
      console.error('SignUp Error:', error);
    }
  };

  const backgroundStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1 // Stay behind everything else
  };
  

  return (
    <>
      <div style={backgroundStyle} /> {/* Background image */}
      <Container className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
        <Card style={sharedCardStyle}>
          <Card.Body>
            <h2 className="text-center mb-4">Sign Up</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={register}>
            <Form.Group id="email" className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
            </Form.Group>
            <Form.Group id="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </Form.Group>
            <Button className="w-100" type="submit" variant="primary">
              Register
            </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              Already have an account? <Link to="/signin">Sign In here</Link>.
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default SignUp;