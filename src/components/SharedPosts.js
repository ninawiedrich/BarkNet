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
        username: postData.username,
        avatar: postData.avatar, // Ensure this field exists in your Firestore documents
        text: postData.text,
        photos: postData.photos,
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
            {post.photos &&
              post.photos.map((url, index) => (
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
      ))}
    </Container>
  );
}

export default SharedPosts;
