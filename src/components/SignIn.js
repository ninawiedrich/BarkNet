import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) && /\W/.test(password);
  };

  const signIn = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long, include an uppercase letter, a number, and a symbol.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/user-profile');
    } catch (error) {
      setError('Failed to sign in. Please check your email and password.');
      console.error('SignIn Error:', error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/user-profile');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google SignIn Error:', error);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Card style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Sign In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={signIn}>
            <Form.Group id="email" className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
            </Form.Group>
            <Form.Group id="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </Form.Group>
            <Button className="w-100" type="submit" variant="primary">
              Sign In
            </Button>
          </Form>
          <Button className="w-100 mt-3" onClick={signInWithGoogle} variant="danger">
            Sign In with Google
          </Button>
          <div className="w-100 text-center mt-3">
            Don't have an account? <Link to="/signup">Register here</Link>.
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SignIn;
