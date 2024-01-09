import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { firestore, storage } from '../firebase-config';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import './PhotoGallery.css';

function PhotoGallery({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [markedPhotos, setMarkedPhotos] = useState([]);

  const fetchPhotos = async () => {
    const photosQuery = query(collection(firestore, 'userPhotos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(photosQuery);
    const photoUrls = [];
    querySnapshot.forEach((doc) => {
      const photoData = doc.data();
      photoUrls.push({ url: photoData.url, id: doc.id });
    });
    setPhotos(photoUrls);
  };

  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  const handleDelete = async (photo) => {
    const imageRef = ref(storage, photo.url);
    await deleteObject(imageRef);
    await deleteDoc(doc(firestore, 'userPhotos', photo.id));
    fetchPhotos();
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

  const toggleMarkedPhoto = (photoId) => {
    if (markedPhotos.includes(photoId)) {
      setMarkedPhotos(markedPhotos.filter((id) => id !== photoId));
    } else {
      setMarkedPhotos([...markedPhotos, photoId]);
    }
  };

  const performActionOnMarkedPhotos = async () => {
    // Implement the logic for performing the action on marked photos here
    // For example, you can delete or share the marked photos
    // Iterate through markedPhotos and apply your logic
    for (const photoId of markedPhotos) {
      // Perform your action (e.g., delete the photo)
      const photoToDelete = photos.find((photo) => photo.id === photoId);
      if (photoToDelete) {
        await handleDelete(photoToDelete);
      }
    }

    // Clear the marked photos after performing the action
    setMarkedPhotos([]);
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
                <Button variant="danger" onClick={() => handleDelete(photo)}>
                  Delete
                </Button>
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
      {markedPhotos.length > 0 && (
        <Button variant="primary" onClick={performActionOnMarkedPhotos}>
          Perform Action
        </Button>
      )}
    </Container>
  );
}

export default PhotoGallery;
