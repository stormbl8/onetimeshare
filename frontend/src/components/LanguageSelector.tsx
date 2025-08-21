// src/components/LanguageSelector.tsx
import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      onChange={handleChange}
      value={i18n.language}
      className="p-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-600 dark:bg-blue-800 dark:hover:bg-blue-900 dark:focus:ring-offset-gray-800 transition-colors duration-200"
    >
      <option value="en">English</option>
      <option value="tr">Türkçe</option>
      <option value="de">Deutsch</option>
    </select>
  );
};

export default LanguageSelector;
