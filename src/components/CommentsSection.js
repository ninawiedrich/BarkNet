import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase-config';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';

function CommentsSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Fetch comments for the post
  useEffect(() => {
    const fetchComments = async () => {
      const q = query(collection(firestore, 'comments'), where('postId', '==', postId), orderBy('createdAt'));
      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map(doc => doc.data());
      setComments(commentsData);
    };

    fetchComments();
  }, [postId]);

  // Handle new comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    const commentData = {
      postId,
      userId: currentUser.uid,
      username: currentUser.displayName || currentUser.email,
      text: newComment,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(firestore, 'comments'), commentData);
      setComments([...comments, commentData]);
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
          <ListGroup.Item key={index}>
            <strong>{comment.username}: </strong> {comment.text}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card.Body>
  );
}

export default CommentsSection;
