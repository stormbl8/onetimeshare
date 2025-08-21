import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { apiBaseUrl } from "../App";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toast";
import LanguageSelector from "./LanguageSelector"; // Import LanguageSelector
import ThemeToggle from "./ThemeToggle"; // Import ThemeToggle

const ReadView: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [requirePassword, setRequirePassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messageVisible, setMessageVisible] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await axios.post(`${apiBaseUrl}/api/read/${token}`, {
          password: "", // try without password first
        });
        // Instead of directly setting message, show confirmation
        setMessage(res.data.message); // Temporarily store message
        setShowConfirmation(true);
        setError(null);
        showToast(t("messageRetrievedSuccessfully"), "success");
      } catch (err: any) {
        if (err.response?.status === 401) {
          setRequirePassword(true);
          setError(t("passwordRequired"));
          showToast(t("passwordRequired"), "info");
        } else if (err.response?.status === 404 || err.response?.status === 410) {
          setError(t("invalidOrExpiredLink"));
          setStatusCode(err.response?.status);
          showToast(t("invalidOrExpiredLink"), "error");
        } else {
          setError(t("failedRetrieve"));
          setStatusCode(err.response?.status);
          showToast(t("failedRetrieve"), "error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [token]); // Removed 't' from dependency array

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusCode(null); // Clear status code on new submission
    setIsLoading(true); // Set loading true on password submission

    try {
      const res = await axios.post(`${apiBaseUrl}/api/read/${token}`, {
        password,
      });
      // Instead of directly setting message, show confirmation
      setMessage(res.data.message); // Temporarily store message
      setShowConfirmation(true);
      setRequirePassword(false);
      setPassword("");
      showToast(t("messageRetrievedSuccessfully"), "success");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError(t("incorrectPassword"));
        setStatusCode(err.response?.status);
        showToast(t("incorrectPassword"), "error");
      } else {
        setError(t("failedRetrieve"));
        setStatusCode(err.response?.status);
        showToast(t("failedRetrieve"), "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealMessage = () => {
    setShowConfirmation(false);
    setTimeout(() => {
      setMessageVisible(true);
    }, 50); // Small delay to ensure CSS transition applies
  };

  const handleCopy = () => {
    if (!message) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      showToast(t("copiedToClipboard"), "success");
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        showToast(t("copiedToClipboard"), "success");
      } catch (err) {
        console.error("Fallback: unable to copy", err);
        showToast(t("failedCopy"), "error");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col gap-4 max-w-md mx-auto w-full">
      {/* Language and Theme Toggles */}
      <div className="flex justify-end -mt-4 -mr-4"> {/* Negative margin to pull them closer to the edge */}
        <div className="flex space-x-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">
          <p>{t("loadingMessage")}</p>
        </div>
      ) : (
        <>
          {statusCode === 404 && (
            <p className="text-red-600 dark:text-red-400 mb-4 text-center">
              {t("messageNotFoundOrAlreadyRead")}
            </p>
          )}

          {statusCode === 410 && (
            <p className="text-red-600 dark:text-red-400 mb-4 text-center">
              {t("messageExpired")}
            </p>
          )}

          {error && !statusCode && (
            <p className="text-red-600 dark:text-red-400 mb-4 text-center">{error}</p>
          )}

          {requirePassword && (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("enterPassword")}
                className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-3 focus:ring-cancomRed focus:border-cancomRed outline-none transition-colors duration-200"
                required
              />
              <button
                type="submit"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
              >
                {t("submit")}
              </button>
            </form>
          )}

          {showConfirmation && message && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-lg flex flex-col items-center gap-4">
              <p className="text-lg font-semibold text-center">
                {t("oneTimeMessageConfirmation")}
              </p>
              <button
                onClick={handleRevealMessage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-yellow-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
              >
                {t("revealMessage")}
              </button>
            </div>
          )}

          {message && !showConfirmation && (
            <div className={`p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-opacity duration-500 ${messageVisible ? "opacity-100" : "opacity-0"}`}>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("oneTimeMessage")}
              </p>
              <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {message}
              </p>
              <button
                onClick={handleCopy}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 mt-4"
              >
                {t("copy")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReadView;
