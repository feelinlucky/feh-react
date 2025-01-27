import React, { useState } from "react";
import "./Dropdown.module.css"; // Import CSS for styling

const Dropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option.value);
    }
  };

  return (
    <div className="dropdown">
      <button className="dropdown-toggle" onClick={toggleDropdown}>
        {selectedOption ? selectedOption.label : "Select an option"}
      </button>
      {isOpen && (
        <ul className="dropdown-menu-overlay">
          {options.map((option) => (
            <li
              key={option.value}
              className="dropdown-item"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;