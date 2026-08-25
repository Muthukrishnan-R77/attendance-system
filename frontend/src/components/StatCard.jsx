import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass = '' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
      {Icon && (
        <div className={`stat-icon-wrapper ${colorClass}`}>
          <Icon size={26} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
