import React from 'react';
import styles from './LogPanel.module.css';

const LogPanel = ({ logText }) => {
  return (
    <div className={styles['log-text-container']}>
      <div className={styles['log-text-header']}>Log</div>
      <div className={styles['log-text-content']}>
        {logText.map((log, index) => (
          <div key={index} className={styles['log-text-item']}>
            {log.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;