import React, { useEffect, useState } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { firestore } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';

function SharedPosts() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(firestore, 'wallPosts'));
    const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container className="my-5">
      <Row>
        {posts.map((post) => (
          <Col key={post.id} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Text>{post.text}</Card.Text>
                {post.photos && post.photos.map((url, index) => (
                  <img key={index} src={url} alt={`Post Image ${index}`} className="img-fluid" />
                ))}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default SharedPosts;
