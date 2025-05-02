import React from 'react';
import { motion } from 'framer-motion';

const PointsMeter = ({ points }) => {
  const milestones = [500, 1000, 2000];
  const nextMilestone = milestones.find(milestone => points < milestone) || milestones[milestones.length - 1];
  const pointsNeeded = nextMilestone - points;

  const progress = Math.min((points / nextMilestone) * 100, 100);

  return (
    <div className="points-meter">
      <h3>Points Meter</h3>
      <div className="progress-bar-outer">
        <motion.div
          className="progress-bar-inner"
          style={{ width: `${progress}%`, background: '#007bff' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="milestones">
        {milestones.map((milestone, index) => (
          <div key={index} className="milestone">
            <span>{milestone} points</span>
            {milestone > points && <span> - {milestone - points} points to go!</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PointsMeter;