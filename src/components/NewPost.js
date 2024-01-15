import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap';
import { firestore, storage } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PhotoGallery from './PhotoGallery'; // Import the PhotoGallery component if needed

function NewPost({ userId, photosData, fetchPhotos, addNewPostToState }) { // Added 'addNewPostToState' prop
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState(null);

  const categories = ['Urgent', 'Daily', 'Buy', 'Sell', 'Walks & Trips', 'Photo'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handlePost = async () => {
    try {
      if (!userId || !postText || !selectedCategory) {
        return;
      }

      let photoUrl = '';

      if (file) {
        const imageRef = ref(storage, `userPhotos/${userId}/${file.name}`);
        await uploadBytes(imageRef, file);
        photoUrl = await getDownloadURL(imageRef);
      }

      const post = {
        userId,
        text: postText,
        category: selectedCategory,
        photoUrl,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(firestore, 'posts'), post);
      console.log('New post added with ID: ', docRef.id);

      // Construct the post object to be added to the state
      const newPostForState = {
        id: docRef.id,
        ...post
      };

      // Call the callback function to update the state in the parent component
      addNewPostToState(newPostForState); // Use 'addNewPostToState' directly

      // Clear form fields
      setPostText('');
      setSelectedCategory('');
      setFile(null);

      // Close the modal
      setShowNewPostModal(false);

      // Fetch updated photos if needed
      if (selectedCategory === 'Photo') {
        fetchPhotos();
      }
    } catch (error) {
      console.error('Error adding new post: ', error);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShowNewPostModal(true)}>
        Create New Post
      </Button>

      <Modal show={showNewPostModal} onHide={() => setShowNewPostModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="postText">
              <Form.Label>Post Text</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your post text"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="categoryDropdown">
              <Form.Label>Category</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="categoryDropdown">
                  {selectedCategory || 'Select a category'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {categories.map((category) => (
                    <Dropdown.Item
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>

            {selectedCategory === 'Photo' && (
              <Form.Group controlId="fileUpload">
                <Form.Label>Upload Photo</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewPostModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePost}>
            Post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NewPost;
