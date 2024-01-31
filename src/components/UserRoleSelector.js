// UserRoleSelector.js

import React from 'react';
import { Form } from 'react-bootstrap';

// Define role options within UserRoleSelector.js
const roleOptions = [
  { label: 'Dog Whisperer aka Trainer', value: 'trainer' },
  { label: 'Dog Walker', value: 'walker' },
  { label: 'Blessed Dog Owner', value: 'owner' },
  { label: 'Dog Caretaker', value: 'caretaker' },
  { label: 'Dog Pension Host', value: 'pension_host' },
  // ... any other roles
];

const UserRoleSelector = ({ selectedRoles, onSelectRole }) => {
  const handleChange = (value) => {
    const updatedRoles = selectedRoles.includes(value)
      ? selectedRoles.filter(role => role !== value)
      : [...selectedRoles, value];
    onSelectRole(updatedRoles);
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
          onChange={() => handleChange(option.value)}
        />
      ))}
    </Form.Group>
  );
};

export default UserRoleSelector;
