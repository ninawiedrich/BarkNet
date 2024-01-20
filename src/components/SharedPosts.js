import React, { useEffect, useState } from 'react';
import { Card, Container } from 'react-bootstrap';
import { firestore } from '../firebase-config'; // Import your Firebase config
import { collection, getDocs } from 'firebase/firestore';

function SharedPosts() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'wallPosts'));
    const postsData = querySnapshot.docs.map((doc) => {
      const postData = doc.data();
      return {
        id: doc.id,
        username: postData.username || 'Default Username', // Provide a default username if not available
        avatar: postData.avatar || 'path/to/default/avatar.jpg', // Provide a default avatar URL
        text: postData.text,
        photos: postData.photos || [], // Ensure this is always an array
        createdAt: postData.createdAt,
      };
    });
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // JSX for rendering posts
  return (
    <Container className="my-5">
      {posts.map((post) => (
        <Card key={post.id} className="mb-3">
          <Card.Header>
            <div className="d-flex align-items-center">
              <img
                src={post.avatar}
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
            {post.photos.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Post Image ${index}`}
                className="img-fluid"
                style={{ maxWidth: '400px', height: 'auto' }}
              />
            ))}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default SharedPosts;
