import React, { useState } from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import { apiBaseUrl, publicHost } from "../App";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toast";
import { encryptMessage } from "../utils/crypto";
import { useClipboard } from "../hooks/useClipboard";
import LanguageSelector from "./LanguageSelector"; // Import LanguageSelector
import ThemeToggle from "./ThemeToggle"; // Import ThemeToggle

const CreateForm: React.FC = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [expireMinutes, setExpireMinutes] = useState(60);
  const [maxViews, setMaxViews] = useState(1); // New state for max views
  const [senderEmail, setSenderEmail] = useState(""); // New state for sender email
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isCopied, copy } = useClipboard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLink("");
    setLoading(true);

    try {
      console.log("[CreateForm] Submitting form with message:", message);
      // 1. Encrypt the message on the client
      const { encrypted, key, iv } = await encryptMessage(message);
      console.log("[CreateForm] Encrypted message:", encrypted);
      console.log("[CreateForm] API base URL:", apiBaseUrl);
      // 2. Send only the encrypted data to the server
      const res = await axios.post(`${apiBaseUrl}/api/v1/create`, {
        encrypted_message: encrypted,
        expire_minutes: expireMinutes,
        max_views: maxViews,
        sender_email: senderEmail, // Pass sender_email to the backend
      });
      console.log("[CreateForm] API response:", res);
      // 3. Create the shareable link with the decryption key in the URL fragment
      const generatedLink = `${publicHost}/read/${res.data.token}#key=${encodeURIComponent(key)}&iv=${encodeURIComponent(iv)}`;
      setLink(generatedLink);

      setMessage("");
      showToast(t("linkCreatedSuccessfully"), "success");
    } catch (err: any) {
      console.error("[CreateForm] Error creating link:", err);
      let errorMessage = t("failedCreate");
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 429) {
          errorMessage = t("tooManyRequests"); // You'll need to add this to your translation files
        } else {
          errorMessage = `${t("failedCreate")} (Server responded with status: ${err.response.status})`;
        }
      }
      showToast(errorMessage, "error");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col gap-4 sm:gap-6 max-w-md w-full mx-auto" role="form" aria-labelledby="create-message-title">
      {/* Language and Theme Toggles */}
      <div className="flex justify-end -mt-2 sm:-mt-4 -mr-2 sm:-mr-4">
        <div className="flex space-x-1 sm:space-x-2">
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
          className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2 sm:p-3 focus:ring-cancomRed focus:border-cancomRed outline-none transition-colors duration-200 resize-y min-h-[80px] sm:min-h-[100px] text-base sm:text-lg"
          required
          aria-required="true"
          aria-label={t("enterMessage")}
        />

        <label htmlFor="expireMinutes" className="sr-only">{t("expirationTime")}</label>
        <select
          id="expireMinutes"
          value={expireMinutes}
          onChange={(e) => setExpireMinutes(parseInt(e.target.value))}
          className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2 sm:p-3 focus:ring-cancomRed focus:border-cancomRed outline-none transition-colors duration-200 text-base sm:text-lg"
          aria-label={t("expirationTime")}
        >
          <option value={15}>15 {t("minutes")}</option>
          <option value={60}>1 {t("hour")}</option>
          <option value={1440}>24 {t("hours")}</option>
        </select>

        {/* New input for Max Views */}
        <label htmlFor="maxViews" className="sr-only">{t("maxViews")}</label>
        <input
          type="number"
          id="maxViews"
          value={maxViews}
          onChange={(e) => setMaxViews(parseInt(e.target.value))}
          placeholder={t("maxViews")}
          min="1"
          className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2 sm:p-3 focus:ring-cancomRed focus:border-cancomRed outline-none transition-colors duration-200 text-base sm:text-lg"
          aria-label={t("maxViews")}
        />

        {/* New input for Sender Email */}
        <label htmlFor="senderEmail" className="sr-only">{t("senderEmail")}</label>
        <input
          type="email"
          id="senderEmail"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          placeholder={t("senderEmail")}
          className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2 sm:p-3 focus:ring-cancomRed focus:border-cancomRed outline-none transition-colors duration-200 text-base sm:text-lg"
          aria-label={t("senderEmail")}
        />

        <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 sm:py-3 px-3 sm:px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 text-base sm:text-lg" aria-label={t("createLink")}> 
          {t("createLink")}
        </button>
      </form>

      {link && (
  <div className="mt-4 p-3 sm:p-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 rounded-lg flex flex-col items-center gap-3 sm:gap-4">
          <p className="text-lg font-semibold">{t("shareLink")}</p>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <input
              type="text"
              value={link}
              readOnly
              className="border border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-800 text-green-900 dark:text-green-100 p-2 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-green-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => copy(link)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-3 sm:px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 w-full sm:w-auto text-sm sm:text-base"
            >
              {isCopied ? t("copied") : t("copy")}
            </button>
          </div>

          {/* QR Code */}
          <div className="p-1 sm:p-2 bg-white dark:bg-gray-900 rounded-md" role="img" aria-label={t('qrCodeForLink')}>
            <QRCode value={link} size={160} level="H" renderAs="svg" fgColor="#1a202c" bgColor="#ffffff" />
          </div>
        </div>
      )}

      {error && <p className="text-red-600 dark:text-red-400 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default CreateForm;