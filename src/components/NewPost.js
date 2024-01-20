import React, { useState } from 'react';
import { Modal, Button, Form, Dropdown, Image } from 'react-bootstrap';
import { firestore, storage } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function NewPost({ userId, fetchPhotos, refreshPosts, username, avatar }) {
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [postText, setPostText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const categories = ['Urgent', 'Daily', 'Buy', 'Sell', 'Walks & Trips', 'Photo'];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // File type and size validation
            if (!selectedFile.type.startsWith('image/') || selectedFile.size > 5242880) {
                alert('Please select an image file smaller than 5MB.');
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handlePost = async () => {
        if (!userId || !postText || !selectedCategory) {
            alert('Please fill in all fields');
            return;
        }

        let photoUrl = '';

        if (file) {
            const imageRef = ref(storage, `userPhotos/${userId}/${file.name}`);
            await uploadBytes(imageRef, file);
            photoUrl = await getDownloadURL(imageRef);
        }

        const newPost = {
            userId,
            text: postText,
            category: selectedCategory,
            photoUrl,
            username,
            avatar,
            createdAt: new Date()
        };

        try {
            await addDoc(collection(firestore, 'wallPosts'), newPost);
            alert('New post added successfully!');
            refreshPosts();
            if (selectedCategory === 'Photo') {
                fetchPhotos();
            }
        } catch (error) {
            console.error('Error adding new post: ', error);
            alert('Failed to create post. Please try again.');
        } finally {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setShowNewPostModal(false);
            setPostText('');
            setSelectedCategory('');
            setFile(null);
            setPreviewUrl(null);
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
                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                    {selectedCategory || 'Select a category'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {categories.map((category, index) => (
                                        <Dropdown.Item key={index} onClick={() => setSelectedCategory(category)}>
                                            {category}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Form.Group>

                        <Form.Group controlId="postText">
                            <Form.Label>Post Text</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
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
