import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button, Modal, Form, Card, Collapse, ListGroup } from 'react-bootstrap';
import { auth, firestore, storage } from '../firebase-config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './UserProfile.css';

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

    const [openFotos, setOpenFotos] = useState(false);
    const [openWalks, setOpenWalks] = useState(false);

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

            const updatedOwnerData = { ...newProfileData.owner, photoUrl };
            const updatedDogData = { ...newProfileData.dog, photoUrl };

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
            <Row>
                <Col md={4} className="profile-sidebar">
                    <Image
                        src={profile.photoUrl || 'path/to/default/image.jpg'}
                        className="profile-image"
                        onClick={() => setShowEditPhoto(true)}
                        alt="User"
                    />
                         <div className="profile-text" style={{textAlign:'center'}}>
                <p>I bring joy into the life of:{profile.owner.name || "Owner's Name"}</p>
                <p><span role="img" aria-label="location">📍</span> We are living in: {profile.owner.city || 'City'}, {profile.owner.state || 'State'}</p>
            </div>
                    <Button variant="primary" className="profile-btn" onClick={() => setOpenDogDetails(!openDogDetails)}>
                        Show Dog's Profile
                    </Button>
                    <Button variant="primary" className="profile-btn" onClick={() => setOpenOwnerDetails(!openOwnerDetails)}>
                        Show Owner's Profile
                    </Button>
                    {/* Additional buttons for "Our Fotos" and "Our Walks" */}
                    <Button variant="primary" className="profile-btn" onClick={() => setOpenFotos(!openFotos)}>
                        Our Fotos
                    </Button>
                    <Button variant="primary" className="profile-btn" onClick={() => setOpenWalks(!openWalks)}>
                        Our Walks
                    </Button>
                </Col>
                <Col md={8}>
                    <Collapse in={openDogDetails}>
                        <Card className="mb-3">
                            <Card.Header>Dog's Profile</Card.Header>
                            {renderProfileDetails(profile.dog)}
                            {openDogDetails && (
                                <Card.Body>
                                    <Button variant="info" onClick={() => setShowEditDog(true)}>
                                        Edit Dog's Profile
                                    </Button>
                                </Card.Body>
                            )}
                        </Card>
                    </Collapse>
                    <Collapse in={openOwnerDetails}>
                        <Card className="mb-3">
                            <Card.Header>Owner's Profile</Card.Header>
                            {renderProfileDetails(profile.owner)}
                            {openOwnerDetails && (
                                <Card.Body>
                                    <Button variant="info" onClick={() => setShowEditOwner(true)}>
                                        Edit Owner's Profile
                                    </Button>
                                </Card.Body>
                            )}
                        </Card>
                    </Collapse>

                           {/* Collapse for Our Fotos */}
                           <Collapse in={openFotos}>
                        <Card className="mb-3">
                            <Card.Header>Our Fotos</Card.Header>
                            <Card.Body>
                                {/* Here you will later insert your component for handling the photo gallery */}
                                <p>Photo gallery coming soon...</p>
                            </Card.Body>
                        </Card>
                    </Collapse>

                    {/* Collapse for Our Walks */}
                    <Collapse in={openWalks}>
                        <Card className="mb-3">
                            <Card.Header>Our Walks</Card.Header>
                            <Card.Body>
                                {/* Here you will later insert your component for handling the walks */}
                                <p>Walks information coming soon...</p>
                            </Card.Body>
                        </Card>
                    </Collapse>
                </Col>
            </Row>

            {/* Modal for Editing Dog's Profile */}
            <Modal show={showEditDog} onHide={handleClose}>
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

            {/* Modal for Editing Owner's Profile */}
            <Modal show={showEditOwner} onHide={handleClose}>
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

            {/* Modal for Editing Profile Photo */}
            <Modal show={showEditPhoto} onHide={handleClose}>
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
