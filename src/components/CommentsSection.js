import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase-config';
import { collection, doc, getDoc, deleteDoc, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Card, Form, Button, ListGroup, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function CommentsSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteDoc(doc(firestore, 'comments', commentId));
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (error) {
        console.error('Error deleting comment: ', error);
      }
    }
  };

  useEffect(() => {
    const fetchCommentsAndUsers = async () => {
      const q = query(collection(firestore, 'comments'), where('postId', '==', postId), orderBy('createdAt'));
      const querySnapshot = await getDocs(q);
      const commentsData = [];
      for (const docSnapshot of querySnapshot.docs) {
        const commentData = docSnapshot.data();
        const userRef = doc(firestore, 'owners', commentData.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          commentsData.push({
            ...commentData,
            username: userData.name,
            avatar: userData.photoUrl,
            id: docSnapshot.id // include the comment's document id
          });
        } else {
          // If user data doesn't exist, push comment with default values
          commentsData.push({
            ...commentData,
            username: 'Anonymous',
            avatar: 'default_avatar_placeholder',
            id: docSnapshot.id
          });
        }
      }
      setComments(commentsData);
    };

    fetchCommentsAndUsers();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    const userRef = doc(firestore, 'owners', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.error('User data not found!');
      return;
    }
    const userData = userSnap.data();

    const commentData = {
      postId,
      userId: currentUser.uid,
      username: userData.name,
      avatar: userData.photoUrl,
      text: newComment,
      createdAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(firestore, 'comments'), commentData);
      setComments([...comments, { ...commentData, id: docRef.id }]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment: ', error);
    }
  };

  return (
    <Card.Body>
      <Form onSubmit={handleCommentSubmit}>
        <Form.Group className="mb-3" controlId="newComment">
          <Form.Control
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">Comment</Button>
      </Form>
      <ListGroup variant="flush">
        {comments.map((comment, index) => (
          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
            <div className="text-muted small">
                Posted on: {new Date(comment.createdAt.seconds * 1000).toLocaleDateString()}
              </div>
              <div className="fw-bold">
                <Image src={comment.avatar || 'default_avatar_placeholder'} roundedCircle style={{ width: '30px', marginRight: '10px' }} />
                {comment.username}
              </div>
              {comment.text}
            </div>
            {comment.userId === currentUser.uid && (
  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteComment(comment.id)}>
    <FontAwesomeIcon icon={faTrash} />
  </Button>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card.Body>
  );
}

export default CommentsSection;
