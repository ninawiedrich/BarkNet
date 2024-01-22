import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Image, Button, Modal, Form, Card, Collapse, ListGroup, InputGroup, FormControl } from 'react-bootstrap';
import { auth, firestore, storage } from '../firebase-config';
import { doc, getDoc, addDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import './UserProfile.css';
import NewPost from './NewPost';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import PhotoGallery from './PhotoGallery';

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
    photoUrl: '/path/to/avatar.jpg',
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
  const [userId, setUserId] = useState(null); // Define userId state
  const [photos, setPhotos] = useState([]); // Define photos state

  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [openWalks, setOpenWalks] = useState(false);

  const [newProfileData, setNewProfileData] = useState({ owner: {}, dog: {} });
  const [file, setFile] = useState(null);

  const friends = [
    { username: 'Friend1', avatar: 'path/to/avatar1.jpg' },
    { username: 'Friend2', avatar: 'path/to/avatar2.jpg' },
    { username: 'Friend3', avatar: 'path/to/avatar3.jpg' },
    { username: 'Friend4', avatar: 'path/to/avatar4.jpg' },
    { username: 'Friend5', avatar: 'path/to/avatar5.jpg' },
  ];

  const [posts, setPosts] = useState([]); // State to store user posts
  
  const [sharePostText, setSharePostText] = useState('');

  const [markedPhotos, setMarkedPhotos] = useState([]); // State to store marked photos

  const [photosData, setPhotosData] = useState({ photos: [], fetchPhotos: () => {} });

  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const [triggerFetch, setTriggerFetch] = useState(false);

  const refreshPosts = async () => {
    const postsQuery = query(collection(firestore, 'wallPosts'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(postsQuery);
    const userPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(userPosts);
};


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        setUserId(user.uid);
        fetchOrCreateProfile(user.uid);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;
  
      const postsQuery = query(collection(firestore, 'wallPosts'), where('userId', '==', userId));
      const querySnapshot = await getDocs(postsQuery);
      const userPosts = querySnapshot.docs.map(doc => {
        // Ensure that photoUrl or photos (whichever field you use) is being fetched correctly
        const data = doc.data();
        return { id: doc.id, ...data };
      });
      setPosts(userPosts);
    };
  
    fetchUserPosts();
  }, [userId, triggerFetch]); // Depend on userId to re-fetch when it changes

  // Fetch or create profile
  const fetchOrCreateProfile = async (userId) => {
    const ownerRef = doc(firestore, 'owners', userId);
    const ownerSnap = await getDoc(ownerRef);

    if (ownerSnap.exists()) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        owner: ownerSnap.data(),
        photoUrl: ownerSnap.data().photoUrl,
      }));
    } else {
      await setDoc(ownerRef, profile.owner);
    }

    const dogRef = doc(firestore, 'dogs', userId);
    const dogSnap = await getDoc(dogRef);
    if (!dogSnap.exists()) {
      await setDoc(dogRef, profile.dog);
    } else {
      setProfile((prevProfile) => ({ ...prevProfile, dog: dogSnap.data() }));
    }
  };

  const handleClose = () => {
    setShowEditOwner(false);
    setShowEditDog(false);
    setShowEditPhoto(false);
  };

  const handleProfilePicChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        console.log("No file selected");
        return;
      }

      if (!userId) {
        console.log("User ID is not defined");
        return;
      }

      const imageRef = ref(storage, `profileImages/${userId}/${file.name}`);

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      // Update profile photo URL in Firestore
      const userDocRef = doc(firestore, 'owners', userId);
      await updateDoc(userDocRef, { photoUrl: downloadURL });

      // Update local state
      setProfile(prevProfile => ({ ...prevProfile, photoUrl: downloadURL }));

    } catch (error) {
      console.error("Error during file upload:", error);
    }
  };

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        console.log("No file selected");
        return;
      }

      const imageRef = ref(storage, `userPhotos/${userId}/${file.name}`);

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      // Add photo URL to Firestore (assuming you have a collection for user photos)
      await addDoc(collection(firestore, 'userPhotos'), {
        userId,
        url: downloadURL,
      });

      // Update the photo gallery
      fetchPhotos();
    } catch (error) {
      console.error("Error during file upload:", error);
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
        dog: { ...prevProfile.dog, ...updatedOwnerData },
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

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  const renderFriendsCarousel = () => (
    <Carousel
      swipeable={true}
      draggable={true}
      showDots={true}
      responsive={responsive}
      ssr={true} // Server-side rendering
      infinite={true}
      autoPlay={profile.autoPlay}
      autoPlaySpeed={1000}
      keyBoardControl={true}
      customTransition="all .5"
      transitionDuration={500}
      containerClass="carousel-container"
      removeArrowOnDeviceType={["tablet", "mobile"]}
      deviceType={profile.deviceType}
      dotListClass="custom-dot-list-style"
      itemClass="carousel-item-padding-40-px"
    >
      {friends.map((friend, idx) => (
        <div key={idx} className="carousel-friend-container">
          <Image src={friend.avatar} roundedCircle className="friend-avatar-img" />
          <p className="friend-username">{friend.username}</p>
        </div>
      ))}
    </Carousel>
  );

  const addNewPostToState = async (newPostData) => {
    try {
      const postDocRef = await addDoc(collection(firestore, 'wallPosts'), newPostData);
  
      // Immediately display the new post by adding it to the existing posts state
      setPosts((prevPosts) => [
        { id: postDocRef.id, ...newPostData },
        ...prevPosts
      ]);
    } catch (error) {
      console.error('Error adding new post: ', error);
    }
  };

  const fetchPhotos = useCallback(async () => {
    const photosQuery = query(collection(firestore, 'userPhotos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(photosQuery);
    const photoUrls = [];
    querySnapshot.forEach((doc) => {
      const photoData = doc.data();
      photoUrls.push({ url: photoData.url, id: doc.id });
    });
    setPhotos(photoUrls);
  }, [userId]);

  const handleShare = async () => {
    if (markedPhotos.length === 0) {
      alert("No photos selected for sharing.");
      return;
    }

    // Get the URLs of the selected photos
    const sharedPhotosUrls = markedPhotos.map(photoId => {
      const photo = photos.find(p => p.id === photoId);
      return photo.url;
    });

    // Create a new post object
    const newPost = {
      userId: userId,
      text: sharePostText,
      photos: sharedPhotosUrls,
      createdAt: new Date(),
      username: profile.owner.name,
      avatar: profile.photoUrl,
    };

    try {
      await addDoc(collection(firestore, 'wallPosts'), newPost);
      alert("Photos shared successfully!");
      setMarkedPhotos([]);
      // Trigger a re-fetch of posts
      setTriggerFetch(prev => !prev);
    } catch (error) {
      console.error("Error sharing photos: ", error);
      alert("Failed to share photos. Please try again.");
    }
  };

  const handleDeleteMarkedPhotos = async () => {
    if (markedPhotos.length === 0) {
      console.log("No photos selected for deletion.");
      return;
    }

    // Extra confirmation step
    const confirmDeletion = window.confirm("Are you sure you want to delete these photos?");
    if (!confirmDeletion) {
      console.log("Deletion cancelled by user.");
      return;
    }

    try {
      const deletePromises = markedPhotos.map(async (photoId) => {

        // Get the Firestore document for the photoId
        const photoDocRef = doc(firestore, 'userPhotos', photoId);
        const photoDoc = await getDoc(photoDocRef);

        // If the document exists and has a url field, proceed with deletion
        if (photoDoc.exists() && photoDoc.data().url) {
          // Extract the file path from the URL stored in Firestore
          const filePath = new URL(photoDoc.data().url).pathname.split('/o/')[1].split('?')[0];
          const decodedFilePath = decodeURIComponent(filePath).replace(/%2F/g, '/');

          // Create a reference to the storage object
          const photoStorageRef = ref(storage, decodedFilePath);

          // Delete the photo from Firebase Storage
          await deleteObject(photoStorageRef);
        }

        // Delete the Firestore document
        await deleteDoc(photoDocRef);
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Update UI by removing deleted photos from state
      setMarkedPhotos([]);

      // Fetch the updated list of photos after deletion
      fetchPhotos();
    } catch (error) {
      console.error("Error deleting marked photos: ", error);
    }
  };

// Function to render user posts along with their photos
const renderPosts = () => {
  return posts.map(post => (
    <Card key={post.id} className="mb-3">
      <Card.Header>
        <div className="d-flex align-items-center">
          <img
            src={post.avatar || 'default_avatar_url'} // Provide a default avatar URL
            alt={`${post.username}'s Avatar`}
            style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
          />
          <span>{post.username}</span>
        </div>
        <small className="text-muted">
          Posted on: {new Date(post.createdAt.seconds * 1000).toLocaleString()}
        </small>
      </Card.Header>
      <Card.Body>
        <Card.Text>{post.text}</Card.Text>
        {/* Check and render photoUrl if it exists */}
        {post.photoUrl && (
          <img
            src={post.photoUrl}
            alt="Post Photo"
            className="img-fluid"
            style={{ maxWidth: '400px', height: 'auto', alignContent: 'center' }}
          />
        )}
        {/* Existing logic for rendering post.photos */}
        {post.photos && post.photos.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Post Image ${index}`}
            className="img-fluid"
            style={{ maxWidth: '400px', height: 'auto', alignContent: 'center' }}
          />
        ))}
      </Card.Body>
    </Card>
  ));
};



return (
  <Container className="my-5">
  <Row>
    <Col md={4} className="profile-sidebar">
      <div className="profile-image-container" onClick={() => setShowEditPhoto(true)}>
        <Image
          src={profile.photoUrl}
          className="profile-image"
          alt="Avatar"
          style={{
            width: '400px', // Adjust the width to your preference
            height: '400px', // Adjust the height to your preference
            objectFit: 'cover',
            borderRadius: '50%',
          }}
        />
  <div className="profile-image-edit-overlay">
    <FontAwesomeIcon icon={faCamera} size="2x" /> {/* Replace with your preferred icon */}
  </div>
</div>
              <div className="profile-text" style={{ textAlign: 'center' }}>
                  <p>I bring joy into the life of: {profile.owner.name || "Owner's Name"}</p>
                  <p><span role="img" aria-label="location">📍</span> We are living in: {profile.owner.city || 'City'}, {profile.owner.state || 'State'}</p>
              </div>
              <Button variant="primary" className="profile-btn" onClick={() => setOpenDogDetails(!openDogDetails)}>
                  Show Dog's Profile
              </Button>
              <Button variant="primary" className="profile-btn" onClick={() => setOpenOwnerDetails(!openOwnerDetails)}>
                  Show Owner's Profile
              </Button>
              <Button variant="primary" className="profile-btn" onClick={() => setShowPhotoGallery(true)}>
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

              {/* Friends Carousel */}
              <Card className="friends-card">
                  <Card.Header className="friends-card-header">
                      Our Friends: <span className="friends-count">{friends.length}</span>
                      <Button variant="link" className="show-all-btn">Show All</Button>
                  </Card.Header>
                  <Card.Body>{renderFriendsCarousel()}</Card.Body>
              </Card>

              {/* New Post Component */}
              <NewPost userId={userId} refreshPosts={refreshPosts} fetchPhotos={fetchPhotos} addNewPostToState={addNewPostToState} username={profile.owner.name} avatar={profile.photoUrl} />

              {/* Posts Section */}
              <Card className="mt-3">
    <Card.Header>Posts</Card.Header>
    <ListGroup variant="flush">
      {renderPosts()} {/* Call the renderPosts function here */}
    </ListGroup>
  </Card>
          </Col>
      </Row>

      <Modal show={showEditPhoto} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>Update Profile Photo</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Select Profile Picture</Form.Label>
        <Form.Control type="file" onChange={handleProfilePicChange} />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>
      Close
    </Button>
  </Modal.Footer>
</Modal>


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

            <Modal show={showPhotoGallery} onHide={() => setShowPhotoGallery(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Our Fotos</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {/* Use the PhotoGallery component here */}
        <PhotoGallery   userId={auth.currentUser.uid}
  markedPhotos={markedPhotos}
  setMarkedPhotos={setMarkedPhotos}
  photosData={photosData}
  setPhotosData={setPhotosData}
  handleDeleteMarkedPhotos={handleDeleteMarkedPhotos}
  photos={photos}
  setPhotos={setPhotos}
  fetchPhotos={fetchPhotos}
  handleFileChange={handleFileChange}  />

<Form.Group controlId="sharePostText">
        <Form.Label>Post Text</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter text to share with the photos"
          value={sharePostText}
          onChange={(e) => setSharePostText(e.target.value)}
        />
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
    <Button variant="primary" onClick={handleShare}>
    Share
</Button>
        <Button variant="secondary" onClick={() => setShowPhotoGallery(false)}>
            Close
        </Button>
        <Button 
    variant="danger" 
    onClick={handleDeleteMarkedPhotos} // Function to delete selected photos
  >
    Delete
  </Button>
                </Modal.Footer>
            </Modal>

            <Row>
        <Col md={4} className="profile-sidebar">
      
        </Col>
    </Row>
        </Container>
    );
}

export default UserProfile;