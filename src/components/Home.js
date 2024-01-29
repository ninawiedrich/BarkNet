// Home.js
import React from 'react';

function Home() {
  const backgroundStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1 // Stay behind everything else
  };

  return (
    <>
      <div style={backgroundStyle} /> {/* Background image */}
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <h1>Welcome to BarkNet</h1>
        <p>The social network for dog owners.</p>
      </div>
    </>
  );
}

export default Home;
