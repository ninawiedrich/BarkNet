// UserRoleSelector.js

import React from 'react';
import { Form } from 'react-bootstrap';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase-config';


const roleOptions = [
  { label: 'Dog Whisperer aka Trainer', value: 'Dog Whisperer aka Trainer' },
  { label: 'Dog Walker', value: 'Dog Walker' },
  { label: 'Blessed Dog Owner', value: 'Blessed Dog Owner' },
  { label: 'Dog Caretaker', value: 'Dog Caretaker' },
  { label: 'Dog AirBnB Host', value: 'Dog AirBnB Host' },
  // ... any other roles
];

const UserRoleSelector = ({ userId, selectedRoles, onSelectRole }) => {
  // Call this function when the user's roles change
  const handleRoleChange = async (selectedRole, isSelected) => {
    if (!userId) {
      console.error("UserId is undefined. Cannot update roles.");
      return;
    }
  
    let updatedRoles = [];
    if (isSelected) {
      updatedRoles = [...selectedRoles, selectedRole];
    } else {
      updatedRoles = selectedRoles.filter(role => role !== selectedRole);
    }

    // Get a reference to the user document
    const userDocRef = doc(firestore, 'owners', userId);


    try {
      // Check if the document exists
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        // Update the document
        await updateDoc(userDocRef, {
          roles: updatedRoles,
        });
      } else {
        // Document does not exist, create it with the roles
        await setDoc(userDocRef, {
          roles: updatedRoles,
        });
      }
      console.log('Roles updated successfully');
      onSelectRole(updatedRoles);
    } catch (error) {
      console.error('Error updating roles: ', error);
    }
  };

  return (
    <Form.Group>
      {roleOptions.map(option => (
        <Form.Check
          key={option.value}
          type="checkbox"
          label={option.label}
          value={option.value}
          checked={selectedRoles.includes(option.value)}
          onChange={(e) => handleRoleChange(option.value, e.target.checked)}
        />
      ))}
    </Form.Group>
  );
};

export default UserRoleSelector;
