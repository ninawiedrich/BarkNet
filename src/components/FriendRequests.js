// FriendRequests.js
import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Card } from 'react-bootstrap';
import { firestore } from '../firebase-config';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, runTransaction } from 'firebase/firestore';

function FriendRequests({ userId }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const q = query(collection(firestore, 'friendRequests'), where('receiverId', '==', userId), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const requestsData = [];
      for (const docSnapshot of querySnapshot.docs) {
        const requestData = docSnapshot.data();
        const senderRef = doc(firestore, 'owners', requestData.senderId);
        const senderSnap = await getDoc(senderRef);
        if (senderSnap.exists()) {
          requestsData.push({
            id: docSnapshot.id,
            senderName: senderSnap.data().name,
            ...requestData
          });
        }
      }
      setRequests(requestsData);
    };

    fetchFriendRequests();
  }, [userId]);

  const handleRequestResponse = async (requestId, status) => {
    // Reference to the friend request document
    const requestRef = doc(firestore, 'friendRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    const requestData = requestSnap.data();
  
    if (status === 'accepted') {
      // Transaction to handle adding friends atomically
      await runTransaction(firestore, async (transaction) => {
        // References to the sender's and receiver's documents in the 'owners' collection
        const senderRef = doc(firestore, 'owners', requestData.senderId);
        const receiverRef = doc(firestore, 'owners', requestData.receiverId);
  
        // Get the current data for both sender and receiver
        const senderDoc = await transaction.get(senderRef);
        const receiverDoc = await transaction.get(receiverRef);
  
        // Get the current friends arrays, or default to an empty array if not set
        const senderFriends = senderDoc.data().friends || [];
        const receiverFriends = receiverDoc.data().friends || [];
  
        // Check if they are already friends (to prevent duplicates)
        if (!senderFriends.includes(requestData.receiverId)) {
          transaction.update(senderRef, {
            friends: [...senderFriends, requestData.receiverId]
          });
        }
  
        if (!receiverFriends.includes(requestData.senderId)) {
          transaction.update(receiverRef, {
            friends: [...receiverFriends, requestData.senderId]
          });
        }
      });
  
      // After the transaction, update the friend request status
      await updateDoc(requestRef, { status: 'accepted' });
    } else {
      // If the friend request is rejected, just update the status
      await updateDoc(requestRef, { status: 'rejected' });
    }
  
    // Update the local state to remove the handled request
    setRequests(requests.filter(request => request.id !== requestId));
  };

  return (
    <Card>
      <Card.Header>Friend Requests</Card.Header>
      <ListGroup variant="flush">
        {requests.map((request) => (
          <ListGroup.Item key={request.id}>
            {request.senderName}
            <Button variant="success" size="sm" onClick={() => handleRequestResponse(request.id, 'accepted')}>
              Accept
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleRequestResponse(request.id, 'rejected')}>
              Reject
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
}

export default FriendRequests;
