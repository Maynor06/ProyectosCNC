import React from 'react';
import idleImg from '../assets/avatar_idle.png';
import processingImg from '../assets/avatar_processing.png';
import doneImg from '../assets/avatar_done.png';
import './Avatar.css'; // We'll create this or use App.css

interface AvatarProps {
  status: 'idle' | 'processing' | 'done';
}

export const Avatar: React.FC<AvatarProps> = ({ status }) => {
  let imgSrc = idleImg;
  let altText = "Avatar idle";

  if (status === 'processing') {
    imgSrc = processingImg;
    altText = "Avatar processing";
  } else if (status === 'done') {
    imgSrc = doneImg;
    altText = "Avatar done";
  }

  return (
    <div className={`avatar-container state-${status}`}>
      <img src={imgSrc} alt={altText} className="avatar-image" />
    </div>
  );
};
