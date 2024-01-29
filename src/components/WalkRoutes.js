import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Image } from 'react-bootstrap';
import { firestore, storage } from '../firebase-config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function WalkRoutes({ userId, showModal, handleClose }) {
  const [newRoute, setNewRoute] = useState('');
  const [routeImage, setRouteImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'walkRoutes'));
      const routesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRoutes(routesData);
    };

    fetchRoutes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRouteImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddRoute = async () => {
    if (newRoute.trim() === '') return;

    let photoUrl = '';
    if (routeImage) {
      const imageRef = ref(storage, `walkRoutes/${userId}/${routeImage.name}`);
      await uploadBytes(imageRef, routeImage);
      photoUrl = await getDownloadURL(imageRef);
    }

    const routeData = {
      userId,
      description: newRoute,
      imageUrl: photoUrl,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(firestore, 'walkRoutes'), routeData);
      setRoutes([...routes, routeData]);
      setNewRoute('');
      setRouteImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error adding new route: ', error);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Our Walks</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="newRoute">
            <Form.Label>Share a New Walk Route</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe the route"
              value={newRoute}
              onChange={(e) => setNewRoute(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="fileUpload">
            <Form.Label>Upload Route Image</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
            {previewUrl && <Image src={previewUrl} alt="Preview" thumbnail />}
          </Form.Group>
          <Button variant="primary" onClick={handleAddRoute}>
            Add Route
          </Button>
        </Form>
        <ListGroup variant="flush" className="mt-3">
          {routes.map((route, index) => (
            <ListGroup.Item key={index}>
              {route.imageUrl && <Image src={route.imageUrl} alt="Route" thumbnail />}
              <p>{route.description}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default WalkRoutes;
