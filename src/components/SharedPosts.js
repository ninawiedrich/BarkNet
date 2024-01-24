import React, { useEffect, useState } from 'react';
import { Card, Container, Button } from 'react-bootstrap';
import { firestore, auth } from '../firebase-config'; // Import your Firebase config
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

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
        photoUrl: postData.photoUrl,
        createdAt: postData.createdAt,
      };
    });
    setPosts(postsData);
  };

  const toggleLikePost = async (postId) => {
    const postRef = doc(firestore, 'wallPosts', postId);
    const postSnap = await getDoc(postRef);
    const currentUserUid = auth.currentUser.uid;

    if (postSnap.exists()) {
      let newLikes = postSnap.data().likes || [];
      if (newLikes.includes(currentUserUid)) {
        newLikes = newLikes.filter(uid => uid !== currentUserUid);
      } else {
        newLikes.push(currentUserUid);
      }
      await updateDoc(postRef, { likes: newLikes });
      setPosts(prevPosts =>
        prevPosts.map(post => 
          post.id === postId ? {...post, likes: newLikes} : post
        )
      );
    }
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
            {/* Check and render photoUrl if it exists */}
            {post.photoUrl && (
              <img
                src={post.photoUrl}
                alt="Post Photo"
                className="img-fluid"
                style={{ maxWidth: '400px', height: 'auto', alignContent: 'center' }}
              />
            )}
            {/* Logic for rendering post.photos */}
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
          <Card.Footer>
            <div className="like-section">
              <Button 
                variant="outline-primary" 
                onClick={() => toggleLikePost(post.id)}
              >
                {post.likes && post.likes.includes(auth.currentUser.uid) ? 'Unlike' : 'Like'}
              </Button>
              <span className="ms-2">{post.likes ? post.likes.length : 0} Likes</span>
            </div>
          </Card.Footer>
        </Card>
      ))}
    </Container>
  );
}

export default SharedPosts;
