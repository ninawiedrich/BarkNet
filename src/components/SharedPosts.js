import React, { useState, useEffect } from 'react';
import { Card, Container, Button, Modal, ListGroup, Image, DropdownButton, Dropdown } from 'react-bootstrap';
import { firestore, auth } from '../firebase-config';
import { collection, getDocs, updateDoc, doc, getDoc, query, orderBy, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import CommentsSection from './CommentsSection';

function SharedPosts() {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [postLikes, setPostLikes] = useState({});
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [currentPostLikes, setCurrentPostLikes] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            let postsQuery;
            if (selectedCategory === 'All') {
                postsQuery = query(collection(firestore, 'wallPosts'), orderBy('createdAt', 'desc'));
            } else {
                postsQuery = query(collection(firestore, 'wallPosts'), where('category', '==', selectedCategory), orderBy('createdAt', 'desc'));
            }

            const querySnapshot = await getDocs(postsQuery);
            const postsData = querySnapshot.docs.map((doc) => {
                const postData = doc.data();
                return {
                    id: doc.id,
                    username: postData.username,
                    avatar: postData.avatar,
                    text: postData.text,
                    photos: postData.photos,
                    photoUrl: postData.photoUrl,
                    createdAt: postData.createdAt.toDate(),
                    likes: postData.likes || [],
                };
            });
            setPosts(postsData);
        };

        fetchPosts();
    }, [selectedCategory]);

    const handleCategorySelect = (eventKey) => {
        setSelectedCategory(eventKey);
    };

    const renderCategoriesDropdown = () => {
        const categories = ['All', 'Urgent', 'Daily', 'Buy', 'Sell', 'Walks & Trips', 'Photo'];
        return (
            <DropdownButton id="category-dropdown" title="Filter by Category" onSelect={handleCategorySelect}>
                {categories.map((category) => (
                    <Dropdown.Item key={category} eventKey={category} active={selectedCategory === category}>
                        {category}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        );
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
    const fetchLikes = async () => {
      const newPostLikes = {};
      for (const post of posts) {
        if (post.likes?.length > 0) {
          const users = await Promise.all(post.likes.map(async (userId) => {
            const userRef = doc(firestore, 'owners', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return { id: userId, ...userSnap.data() };
            }
            return null;
          }));
          newPostLikes[post.id] = users.filter(Boolean);
        }
      }
      setPostLikes(newPostLikes);
    };

    if (posts.length > 0) {
      fetchLikes();
    }
  }, [posts]);

  const handleLikesClick = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const likes = post.likes || [];
    const users = await Promise.all(likes.map(async (userId) => {
      const userRef = doc(firestore, 'owners', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: userId, ...userSnap.data() };
      }
      return null;
    }));

    setCurrentPostLikes(users.filter(Boolean));
    setShowLikesModal(true);
    console.log("Clicked post ID:", postId);
  console.log("User IDs in modal:", users.map(u => u.id));
  };



  // JSX for rendering posts
  const renderPosts = () => {
    return posts.map((post) => (
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
          <span className="ms-2" onClick={() => handleLikesClick(post.id)}>
            {post.likes ? post.likes.length : 0} Likes
          </span>
        </div>
          </Card.Footer>
              {/* integrate CommentsSection */}
    <CommentsSection postId={post.id} currentUser={auth.currentUser} />
        </Card>
      ))}
      

       {/* Modal for displaying users who liked a post */}
       <Modal show={showLikesModal} onHide={() => setShowLikesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Users Who Liked This Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {currentPostLikes.map((user) => (
              <ListGroup.Item key={user.id}>
                <Link to={`/user-profile/${user.id}`}>
                  <Image 
                    src={user.photoUrl || 'path_to_default_avatar_image'}
                    roundedCircle 
                    style={{ width: '30px', marginRight: '10px' }} 
                    alt={user.name}
                  />
                  {user.name}
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLikesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    

return (
  <Container className="my-5">
      {renderCategoriesDropdown()}
      {renderPosts()}
      {/* Existing modal and other component logic */}
  </Container>
  );
};


export default SharedPosts;
