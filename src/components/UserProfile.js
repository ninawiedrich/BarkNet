import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button, Modal, Form, Card, Collapse, ListGroup } from 'react-bootstrap';
import { auth, firestore, storage } from '../firebase-config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function UserProfile() {
    const [profile, setProfile] = useState({
        owner: {
            name: '',
            age: '',
            rasse: '',
            kastriert: '',
            specialEffects: '',
            likeKids: '',
            likeDogs: '',
            likeCats: '',
            likePeople: '',
            favoriteFood: '',
            favoriteTrick: '',
            favoriteToy: '',
            favoritePlace: '',
            city: '',
            state: '',
        },
        dog: {
            name: '',
            age: '',
            rasse: '',
            kastriert: '',
            specialEffects: '',
            likeKids: '',
            likeDogs: '',
            likeCats: '',
            likePeople: '',
            favoriteFood: '',
            favoriteTrick: '',
            favoriteToy: '',
            favoritePlace: '',
        },
        photoUrl: 'default.jpg',
        togetherActivities: '',
        meetStory: '',
        likes: '',
        dislikes: '',
        memorableTrip: '',
        sharedMeal: '',
    });

    const [openDogDetails, setOpenDogDetails] = useState(false);
    const [openOwnerDetails, setOpenOwnerDetails] = useState(false);
    const [showEditOwner, setShowEditOwner] = useState(false);
    const [showEditDog, setShowEditDog] = useState(false);
    const [showEditPhoto, setShowEditPhoto] = useState(false);
    const [newProfileData, setNewProfileData] = useState({ owner: {}, dog: {} });
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
                await setDoc(ownerRef, profile.owner);
            } else {
                setProfile((prevProfile) => ({ ...prevProfile, owner: ownerSnap.data() }));
            }

            const dogRef = doc(firestore, 'dogs', userId);
            const dogSnap = await getDoc(dogRef);
            if (!dogSnap.exists()) {
                await setDoc(dogRef, profile.dog);
            } else {
                setProfile((prevProfile) => ({ ...prevProfile, dog: dogSnap.data() }));
            }
        };

        fetchOrCreateProfile();
    }, []);

    const handleClose = () => {
        setShowEditOwner(false);
        setShowEditDog(false);
        setShowEditPhoto(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleChange = (entity, field) => (e) => {
        setNewProfileData((prevData) => ({
            ...prevData,
            [entity]: { ...prevData[entity], [field]: e.target.value },
        }));
    };

    const handleProfileUpdate = async () => {
        if (!auth.currentUser) {
            console.log('No user logged in');
            return;
        }
        const userId = auth.currentUser.uid;

        try {
            let photoUrl = profile.photoUrl;
            if (file) {
                const imageRef = ref(storage, `profileImages/${userId}/${file.name}`);
                await uploadBytes(imageRef, file);
                photoUrl = await getDownloadURL(imageRef);
            }

            const updatedOwnerData = { ...newProfileData.owner };
            if (photoUrl) {
                updatedOwnerData.photoUrl = photoUrl;
            }

            const updatedDogData = { ...newProfileData.dog };
            if (photoUrl) {
                updatedDogData.photoUrl = photoUrl;
            }

            await updateDoc(doc(firestore, 'owners', userId), updatedOwnerData);
            await updateDoc(doc(firestore, 'dogs', userId), updatedDogData);

            setProfile((prevProfile) => ({
                ...prevProfile,
                owner: { ...prevProfile.owner, ...updatedOwnerData },
                dog: { ...prevProfile.dog, ...updatedDogData },
                photoUrl,
            }));
            handleClose();
        } catch (error) {
            console.error('Error updating profile: ', error);
        }
    };

    const renderProfileDetails = (details) => {
        return Object.entries(details).map(([key, value]) => {
            if (key !== 'photoUrl') {
                return (
                    <ListGroup.Item key={key}>
                        {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}
                    </ListGroup.Item>
                );
            }
            return null;
        });
    };

    return (
        <Container className="my-5">
            {/* Profile header */}
            <Row>
                <Col md={12} className="text-center">
                    <Image
                        src={profile.photoUrl || 'path/to/default/image.jpg'}
                        roundedCircle
                        fluid
                        className="profile-image"
                        style={{ maxWidth: '150px', cursor: 'pointer' }}
                        onClick={() => setShowEditPhoto(true)}
                        alt="Click to edit photo"
                        title="Click to edit photo"
                    />
                    <h2>{profile.dog.name || "Dog's Name"}</h2>
                    <p>
                        Owned by {profile.owner.name || "Owner's Name"} from {profile.owner.city || 'City'},{' '}
                        {profile.owner.state || 'State'}
                    </p>
                </Col>
            </Row>

            {/* Dog's Profile Collapsible */}
            <Row className="mt-4">
                <Col md={6}>
                    <Button
                        onClick={() => setOpenDogDetails(!openDogDetails)}
                        aria-controls="dog-details-collapse"
                        aria-expanded={openDogDetails}
                        variant="primary"
                    >
                        {openDogDetails ? 'Hide' : 'Show'} Dog's Profile
                    </Button>
                    <Collapse in={openDogDetails}>
                        <div id="dog-details-collapse">
                            <Card className="mb-3">
                                <Card.Header>Dog's Profile</Card.Header>
                                <ListGroup variant="flush">
                                    {renderProfileDetails(profile.dog)}
                                </ListGroup>
                            </Card>
                            <Button variant="primary" onClick={() => setShowEditDog(true)}>
                                Edit Dog's Profile
                            </Button>
                        </div>
                    </Collapse>
                </Col>

                {/* Owner's Profile Collapsible */}
                <Col md={6}>
                    <Button
                        onClick={() => setOpenOwnerDetails(!openOwnerDetails)}
                        aria-controls="owner-details-collapse"
                        aria-expanded={openOwnerDetails}
                        variant="primary"
                    >
                        {openOwnerDetails ? 'Hide' : 'Show'} Owner's Profile
                    </Button>
                    <Collapse in={openOwnerDetails}>
                        <div id="owner-details-collapse">
                            <Card className="mb-3">
                                <Card.Header>Owner's Profile</Card.Header>
                                <ListGroup variant="flush">
                                    {renderProfileDetails(profile.owner)}
                                </ListGroup>
                            </Card>
                            <Button variant="primary" onClick={() => setShowEditOwner(true)}>
                                Edit Owner's Profile
                            </Button>
                        </div>
                    </Collapse>
                </Col>
            </Row>

            {/* Edit Dog's Profile Modal */}
            <Modal show={showEditDog} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Dog's Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {Object.entries(profile.dog).map(([key, value]) => {
                            if (key !== 'photoUrl') {
                                return (
                                    <Form.Group className="mb-3" key={key}>
                                        <Form.Label>{`${key.charAt(0).toUpperCase() + key.slice(1)}`}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newProfileData.dog[key] || value}
                                            onChange={handleChange('dog', key)}
                                        />
                                    </Form.Group>
                                );
                            }
                            return null;
                        })}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleProfileUpdate}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Owner's Profile Modal */}
            <Modal show={showEditOwner} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Owner's Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {Object.entries(profile.owner).map(([key, value]) => {
                            if (key !== 'photoUrl') {
                                return (
                                    <Form.Group className="mb-3" key={key}>
                                        <Form.Label>{`${key.charAt(0).toUpperCase() + key.slice(1)}`}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newProfileData.owner[key] || value}
                                            onChange={handleChange('owner', key)}
                                        />
                                    </Form.Group>
                                );
                            }
                            return null;
                        })}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleProfileUpdate}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Photo Modal */}
            <Modal show={showEditPhoto} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Photo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Photo</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleProfileUpdate}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default UserProfile;
