import React, { useState } from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import { apiBaseUrl, publicHost } from "../App";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toast";
import LanguageSelector from "./LanguageSelector"; // Import LanguageSelector
import ThemeToggle from "./ThemeToggle"; // Import ThemeToggle

const CreateForm: React.FC = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [expireMinutes, setExpireMinutes] = useState(60);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLink("");
    setLoading(true);

    try {
      // Create the one-time message
  const res = await axios.post(`${apiBaseUrl}/api/v1/create`, {
        message,
        password: password || undefined,
        expire_minutes: expireMinutes,
      });

      // Dynamically generate link using publicHost
      const generatedLink = `${publicHost}/read/${res.data.token}`;
      console.log("Generated link for QR code:", generatedLink);
      setLink(generatedLink);

      // Clear inputs
      setMessage("");
      setPassword("");
      showToast(t("linkCreatedSuccessfully"), "success");
    } catch (err: any) {
      console.error("Error creating link:", err);
      showToast(t("failedCreate"), "error");
      setError(t("failedCreate"));
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col gap-6 max-w-md mx-auto w-full" role="form" aria-labelledby="create-message-title">
      {/* Language and Theme Toggles */}
      <div className="flex justify-end -mt-4 -mr-4"> {/* Negative margin to pull them closer to the edge */}
        <div className="flex space-x-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

  <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Create one-time message">
        {loading && (
          <div className="flex justify-center items-center py-2">
            <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="ml-2">{t("loading")}</span>
          </div>
        )}
        <label htmlFor="message" id="create-message-title" className="sr-only">{t("enterMessage")}</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("enterMessage")}
          className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-3 focus:ring-cancomRed focus:border-cancomRed outline-none transition-colors duration-200 resize-y min-h-[100px]"
          required
          aria-required="true"
          aria-label={t("enterMessage")}
        />

        <label htmlFor="password" className="sr-only">{t("optionalPassword")}</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("optionalPassword")}
          className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-3 focus:ring-cancomRed focus:border-cancomRed outline-none transition-colors duration-200"
          aria-label={t("optionalPassword")}
        />

        <label htmlFor="expireMinutes" className="sr-only">{t("expirationTime")}</label>
        <select
          id="expireMinutes"
          value={expireMinutes}
          onChange={(e) => setExpireMinutes(parseInt(e.target.value))}
          className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-3 focus:ring-cancomRed focus:border-cancomRed outline-none transition-colors duration-200"
          aria-label={t("expirationTime")}
        >
          <option value={15}>15 {t("minutes")}</option>
          <option value={60}>1 {t("hour")}</option>
          <option value={1440}>24 {t("hours")}</option>
        </select>

        <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100" aria-label={t("createLink")}>
          {t("createLink")}
        </button>
      </form>

      {link && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 rounded-lg flex flex-col items-center gap-4">
          <p className="text-lg font-semibold">{t("shareLink")}</p>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <input
              type="text"
              value={link}
              readOnly
              className="border border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-800 text-green-900 dark:text-green-100 p-2 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(link);
                } else {
                  const textArea = document.createElement("textarea");
                  textArea.value = link;
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  try {
                    document.execCommand("copy");
                  } catch (err) {
                    console.error("Fallback: Oops, unable to copy", err);
                  }
                  document.body.removeChild(textArea);
                }
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 w-full sm:w-auto"
            >
              {t("copy")}
            </button>
          </div>

          {/* QR Code */}
          <div className="p-2 bg-white dark:bg-gray-900 rounded-md">
            <QRCode value={link} size={160} level="H" renderAs="svg" fgColor="#1a202c" bgColor="#ffffff" />
          </div>
        </div>
      )}

      {error && <p className="text-red-600 dark:text-red-400 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default CreateForm;