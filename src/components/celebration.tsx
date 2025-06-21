'use client';

import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface CelebrationProps {
  onComplete: () => void;
}

export default function Celebration({ onComplete }: CelebrationProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Ensure this runs only on the client
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const timer = setTimeout(onComplete, 7000); // Confetti lasts for 7 seconds
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (dimensions.width === 0) return null;

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={400}
      gravity={0.1}
      initialVelocityY={20}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
    />
  );
}
