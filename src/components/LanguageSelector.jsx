import React, { useState, useEffect, useRef } from 'react';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code) => {
    setCurrentLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button 
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        title={languages[currentLanguage].name}
      >
        <FontAwesomeIcon icon={faGlobe} className="globe-icon" />
        <span className="current-language-flag">{languages[currentLanguage].flag}</span>
      </button>

      <div className={`language-dropdown ${isOpen ? 'open' : ''}`}>
        {Object.entries(languages).map(([code, lang]) => (
          <button
            key={code}
            className={`language-option ${currentLanguage === code ? 'active' : ''}`}
            onClick={() => handleLanguageChange(code)}
          >
            <span className="language-flag">{lang.flag}</span>
            <span className="language-name">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;