import React, { useEffect, useState } from 'react';
import styles from './Animations.module.css';

export default function ScorePopup({ points, visible, onComplete }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (visible && points > 0) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible, points, onComplete]);
  
  if (!show || points <= 0) return null;
  
  return (
    <div className={styles.scorePopup} style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
      color: '#0d1f1a',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '24px',
      fontWeight: 'bold',
      boxShadow: '0 4px 20px rgba(251, 191, 36, 0.5)',
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      +{points}!
    </div>
  );
}
