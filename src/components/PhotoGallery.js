import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { firestore, storage } from '../firebase-config';
import { collection, query, where, getDocs, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import './PhotoGallery.css';

function PhotoGallery({ userId, markedPhotos, setMarkedPhotos, handleDeleteMarkedPhotos, photos, setPhotos, fetchPhotos}) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);


  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const toggleMarkedPhoto = (photoId) => {
    if (markedPhotos.includes(photoId)) {
      // If photoId is already in markedPhotos, remove it
      setMarkedPhotos((prevMarkedPhotos) => prevMarkedPhotos.filter((id) => id !== photoId));
    } else {
      // If photoId is not in markedPhotos, add it
      setMarkedPhotos((prevMarkedPhotos) => [...prevMarkedPhotos, photoId]);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const imageRef = ref(storage, `userPhotos/${userId}/${file.name}`);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    await addDoc(collection(firestore, 'userPhotos'), {
      userId,
      url: downloadURL,
    });
    fetchPhotos();
  };

  const FileUploadButton = () => (
    <label className="file-upload-button">
      <FontAwesomeIcon icon={faPlusCircle} size="2x" />
      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
    </label>
  );


  return (
    <Container>
      <FileUploadButton />
      <Row xs={1} md={2} lg={3} className="g-4">
        {photos.map((photo) => (
          <Col key={photo.id}>
            <Card>
              <Card.Img variant="top" src={photo.url} className="photo-image" />
              <Card.Body>
                <Form.Check
                  type="checkbox"
                  label="Mark for Action"
                  checked={markedPhotos.includes(photo.id)}
                  onChange={() => toggleMarkedPhoto(photo.id)}
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the selected photos?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDeleteMarkedPhotos(null, true)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default PhotoGallery;