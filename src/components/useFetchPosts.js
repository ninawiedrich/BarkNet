import { useState, useEffect } from 'react';
import { firestore } from '../firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';

const useFetchPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'wallPosts'), (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return unsubscribe; // Detach listener when the component unmounts
  }, []);

  return posts;
};

export default useFetchPosts;
