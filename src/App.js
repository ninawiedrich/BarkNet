import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import Home from './components/Home';
import SignUp from './components/SignUp';
import UserProfile from './components/UserProfile';
import SharedPosts from './components/SharedPosts';

import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/shared-posts" element={<SharedPosts />} />
      </Routes>
    </Router>
  );
}

export default App;
