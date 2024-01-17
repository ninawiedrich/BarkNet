import React, { useState } from 'react';
import { Modal, Button, Form, Dropdown, Image } from 'react-bootstrap';
import { firestore, storage } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function NewPost({ userId, fetchPhotos, addNewPostToState }) {
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const categories = ['Urgent', 'Daily', 'Buy', 'Sell', 'Walks & Trips', 'Photo'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Example validation: File type check
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Example validation: File size check (e.g., less than 5MB)
      if (selectedFile.size > 5242880) {
        alert('File size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Create a URL for preview
    }
  };

  const handlePost = async () => {
    try {
      if (!userId || !postText || !selectedCategory) {
        alert('Please fill in all fields');
        return;
      }
  
      let photoUrl = '';
  
      // If a file is selected, upload it and get the download URL
      if (file) {
        const imageRef = ref(storage, `userPhotos/${userId}/${file.name}`);
        const uploadTask = await uploadBytes(imageRef, file);
        photoUrl = await getDownloadURL(uploadTask.ref);
      }
  
      // Create the post object with text, category, and photo URL
      const post = {
        userId,
        text: postText,
        category: selectedCategory,
        photoUrl, // This will be an empty string if no photo was uploaded
        createdAt: new Date(),
      };
  
      // Add the post to Firestore
      const docRef = await addDoc(collection(firestore, 'posts'), post);
      console.log('New post added with ID: ', docRef.id);
  
      // Call the callback function to update the state in the parent component
      addNewPostToState({
        id: docRef.id,
        ...post,
      });
  
      // Clear form fields and reset states
      setPostText('');
      setSelectedCategory('');
      setFile(null);
      setPreviewUrl(null);
  
      // Close the modal
      setShowNewPostModal(false);
  
      // Fetch updated photos if needed
      if (selectedCategory === 'Photo') {
        fetchPhotos();
      }
    } catch (error) {
      console.error('Error adding new post: ', error);
      alert('Failed to create post. Please try again.');
    } finally {
      // Revoke the preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
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

            <Form.Group controlId="postText">
              <Form.Label>Post Text</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your post text"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="fileUpload">
          <Form.Label>Upload Photo</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
          {previewUrl && <Image src={previewUrl} alt="Preview" thumbnail />}
        </Form.Group>
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