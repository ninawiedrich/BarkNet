import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, ListGroup, Button, Modal, Form, Card } from 'react-bootstrap';
import { auth, firestore, storage } from '../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function UserProfile() {
  const [profile, setProfile] = useState({
    owner: { name: '', age: '', rasse: '', kastriert: '', specialEffects: '', likeKids: '', likeDogs: '', likeCats: '', likePeople: '', favoriteFood: '', favoriteTrick: '', favoriteToy: '', favoritePlace: '' },
    dog: { name: '', age: '', rasse: '', kastriert: '', specialEffects: '', likeKids: '', likeDogs: '', likeCats: '', likePeople: '', favoriteFood: '', favoriteTrick: '', favoriteToy: '', favoritePlace: '' },
    photoUrl: 'default.jpg',
    togetherActivities: '',
    meetStory: '',
    likes: '',
    dislikes: '',
    memorableTrip: '',
    sharedMeal: ''
  });
  const [show, setShow] = useState(false);
  const [newProfileData, setNewProfileData] = useState({
    owner: {},
    dog: {},
    photoUrl: '',
    togetherActivities: '',
    meetStory: '',
    likes: '',
    dislikes: '',
    memorableTrip: '',
    sharedMeal: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchOrCreateProfile = async () => {
      if (!auth.currentUser) {
        console.log('User not logged in');
        return;
      }
      const userId = auth.currentUser.uid;

      const ownerRef = doc(firestore, 'owners', userId);
      const ownerSnap = await getDoc(ownerRef);
      if (!ownerSnap.exists()) {
        await updateDoc(ownerRef, newProfileData.owner);
      }

      const dogRef = doc(firestore, 'dogs', userId);
      const dogSnap = await getDoc(dogRef);
      if (!dogSnap.exists()) {
        await updateDoc(dogRef, newProfileData.dog);
      }

      const updatedOwnerSnap = await getDoc(ownerRef);
      const updatedDogSnap = await getDoc(dogRef);
      setProfile({
        owner: updatedOwnerSnap.data(),
        dog: updatedDogSnap.data(),
        photoUrl: updatedOwnerSnap.data().photoUrl || updatedDogSnap.data().photoUrl || 'default.jpg',
        togetherActivities: updatedOwnerSnap.data().togetherActivities || '',
        meetStory: updatedOwnerSnap.data().meetStory || '',
        likes: updatedOwnerSnap.data().likes || '',
        dislikes: updatedOwnerSnap.data().dislikes || '',
        memorableTrip: updatedOwnerSnap.data().memorableTrip || '',
        sharedMeal: updatedOwnerSnap.data().sharedMeal || ''
      });
    };

    fetchOrCreateProfile();
  }, []);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleProfileUpdate = async () => {
    if (!auth.currentUser) {
      console.log('No user logged in');
      return;
    }
    const userId = auth.currentUser.uid;

    try {
      if (file) {
        const imageRef = ref(storage, `profileImages/${userId}`);
        await uploadBytes(imageRef, file);
        const photoUrl = await getDownloadURL(imageRef);
        newProfileData.photoUrl = photoUrl;
      }

      await updateDoc(doc(firestore, 'owners', userId), { ...newProfileData.owner, photoUrl: newProfileData.photoUrl });
      await updateDoc(doc(firestore, 'dogs', userId), { ...newProfileData.dog, photoUrl: newProfileData.photoUrl });

      setProfile(newProfileData);
      console.log('Profile updated successfully');
      setShow(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  const handleChange = (entity, field) => (e) => {
    setNewProfileData(prevData => ({
      ...prevData,
      [entity]: { ...prevData[entity], [field]: e.target.value }
    }));
  };

  const handleSharedChange = (field) => (e) => {
    setNewProfileData({ ...newProfileData, [field]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <Container className="my-5">
      <Row>
        <Col md={12} className="text-center">
          <h2 className="mb-3">Our Shared Profile</h2>
          <Image src={profile.photoUrl} roundedCircle fluid className="profile-image" style={{ maxWidth: '150px' }} />
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Dog's Profile */}
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>Dog's Profile</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>Name: {profile.dog.name}</ListGroup.Item>
              <ListGroup.Item>Age: {profile.dog.age}</ListGroup.Item>
              <ListGroup.Item>Rasse: {profile.dog.rasse}</ListGroup.Item>
              <ListGroup.Item>Kastriert/Sterilisiert: {profile.dog.kastriert}</ListGroup.Item>
              <ListGroup.Item>Special Effects: {profile.dog.specialEffects}</ListGroup.Item>
              <ListGroup.Item>Like Kids: {profile.dog.likeKids}</ListGroup.Item>
              <ListGroup.Item>Like Dogs: {profile.dog.likeDogs}</ListGroup.Item>
              <ListGroup.Item>Like Cats: {profile.dog.likeCats}</ListGroup.Item>
              <ListGroup.Item>Like People: {profile.dog.likePeople}</ListGroup.Item>
              <ListGroup.Item>Favorite Food: {profile.dog.favoriteFood}</ListGroup.Item>
              <ListGroup.Item>Favorite Trick: {profile.dog.favoriteTrick}</ListGroup.Item>
              <ListGroup.Item>Favorite Toy: {profile.dog.favoriteToy}</ListGroup.Item>
              <ListGroup.Item>Favorite Place: {profile.dog.favoritePlace}</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Owner's Profile */}
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>Owner's Profile</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>Name: {profile.owner.name}</ListGroup.Item>
              <ListGroup.Item>Age: {profile.owner.age}</ListGroup.Item>
              <ListGroup.Item>Rasse: {profile.owner.rasse}</ListGroup.Item>
              <ListGroup.Item>Kastriert/Sterilisiert: {profile.owner.kastriert}</ListGroup.Item>
              <ListGroup.Item>Special Effects: {profile.owner.specialEffects}</ListGroup.Item>
              <ListGroup.Item>Like Kids: {profile.owner.likeKids}</ListGroup.Item>
              <ListGroup.Item>Like Dogs: {profile.owner.likeDogs}</ListGroup.Item>
              <ListGroup.Item>Like Cats: {profile.owner.likeCats}</ListGroup.Item>
              <ListGroup.Item>Like People: {profile.owner.likePeople}</ListGroup.Item>
              <ListGroup.Item>Favorite Food: {profile.owner.favoriteFood}</ListGroup.Item>
              <ListGroup.Item>Favorite Trick: {profile.owner.favoriteTrick}</ListGroup.Item>
              <ListGroup.Item>Favorite Toy: {profile.owner.favoriteToy}</ListGroup.Item>
              <ListGroup.Item>Favorite Place: {profile.owner.favoritePlace}</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col className="text-center mt-4">
          <Button variant="primary" onClick={handleShow}>Edit Profiles</Button>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profiles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <h5>Upload New Photo</h5>
            <Form.Group className="mb-3">
              <Form.Label>Photo</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>

            {/* Dog's Profile Form Fields */}
            <h5>Dog's Profile</h5>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Dog's name" value={newProfileData.dog.name} onChange={handleChange('dog', 'name')} />
            </Form.Group>
            {/* Additional form fields for dog's profile details */}

            {/* Owner's Profile Form Fields */}
            <h5>Owner's Profile</h5>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Owner's name" value={newProfileData.owner.name} onChange={handleChange('owner', 'name')} />
            </Form.Group>
            {/* Additional form fields for owner's profile details */}

            {/* Shared Experiences Form Fields */}
            <h5>Shared Experiences</h5>
            <Form.Group className="mb-3">
              <Form.Label>Things we love to do together</Form.Label>
              <Form.Control type="text" placeholder="Activities" value={newProfileData.togetherActivities} onChange={handleSharedChange('togetherActivities')} />
            </Form.Group>
            {/* Additional form fields for shared experiences */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleProfileUpdate}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserProfile;
