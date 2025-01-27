import React, { useState } from "react";
import "./Dropdown.module.css"; // Import CSS for styling

const Dropdown = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  const options = ["Option 1", "Option 2", "Option 3"];

  return (
    <div className="dropdown">
      <button className="dropdown-toggle" onClick={toggleDropdown}>
        {selectedOption || "Select an option"}
      </button>
      {isOpen && (
        <ul className="dropdown-menu-overlay">
          {options.map((option) => (
            <li
              key={option}
              className="dropdown-item"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;