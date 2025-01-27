import React, { useState } from 'react';
import styles from './LogTextContainer.module.css';
import Dropdown from '../dropdown/Dropdown';

const LogTextContainer = ({ logText, activeTab, setActiveTab, errorLogging, setErrorLogging }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleDropdownSelect = (option) => {
    setSelectedOption(option);
  };

  const categorizedLogs = logText.filter(log => log.category !== "uncategorized");
  const uncategorizedLogs = logText.filter(log => log.category === "uncategorized");

  return (
    <div className={styles['log-text-container']}>
      <Dropdown onSelect={handleDropdownSelect} />
      <div className={styles['log-text-header']}>
        Selected Option: {selectedOption}
      </div>
      <div className={styles['log-text-tabs']}>
        <button
          className={activeTab === "categorized" ? styles['active-tab'] : ""}
          onClick={() => setActiveTab("categorized")}
        >
          Categorized
        </button>
        <button
          className={activeTab === "uncategorized" ? styles['active-tab'] : ""}
          onClick={() => setActiveTab("uncategorized")}
        >
          Uncategorized
        </button>
      </div>
      <div className={styles['log-text-content']}>
        {activeTab === "categorized" ? (
          categorizedLogs.map((log, index) => (
            <div key={index} className={styles['log-text-item']}>
              {log.text}
            </div>
          ))
        ) : (
          uncategorizedLogs.map((log, index) => (
            <div key={index} className={styles['log-text-item']}>
              {log.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogTextContainer;