import React, { useState } from 'react';
import styles from './LogTextContainer.module.css';
import Dropdown from '../dropdown/Dropdown';

const LogTextContainer = ({ logText, activeTab, setActiveTab, errorLogging, setErrorLogging }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const modeOptions = [
    { value: 1, label: "log text" },
    { value: 2, label: "debug" }
  ];

  const handleDropdownSelect = (modeOption) => {
    setSelectedMode(modeOption);
  };

  const categorizedLogs = logText.filter(log => log.category !== "uncategorized");
  const uncategorizedLogs = logText.filter(log => log.category === "uncategorized");

  return (
    <div className={styles['log-text-container']}>
      <Dropdown options={modeOptions} onSelect={handleDropdownSelect} />
      {(selectedMode === 1) && (
        <>
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
        </>
      )}
      {(selectedMode === 2) && (
        <>
          {/* import DebugDisplay component here */}
        </>
      )}
    </div>
  );
};

export default LogTextContainer;