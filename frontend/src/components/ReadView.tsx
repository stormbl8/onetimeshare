import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { apiBaseUrl } from "../App";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toast";
import { decryptMessage } from "../utils/crypto";
import { useClipboard } from "../hooks/useClipboard";
import LanguageSelector from "./LanguageSelector"; // Import LanguageSelector
import ThemeToggle from "./ThemeToggle"; // Import ThemeToggle

const ReadView: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messageVisible, setMessageVisible] = useState(false);
  const { isCopied, copy } = useClipboard();
  const fetchInitiated = useRef(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        // 1. Parse the decryption key and IV from the URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const key = hashParams.get('key');
        const iv = hashParams.get('iv');

        if (!key || !iv) {
          throw new Error("Decryption key or IV not found in URL fragment.");
        }

        // 2. Fetch the encrypted message from the server
        const res = await axios.post(`${apiBaseUrl}/api/v1/read/${token}`);
        const encryptedMessage = res.data.encrypted_message;

        // 3. Decrypt the message on the client
        const decrypted = await decryptMessage(encryptedMessage, key, iv);

        setMessage(decrypted);
        setShowConfirmation(true);
        setError(null);
        setStatusCode(null);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 410) {
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

    if (!fetchInitiated.current) {
      fetchInitiated.current = true;
      fetchMessage();
    }
  }, [token, t]);

  const handleRevealMessage = () => {
    setShowConfirmation(false);
    setTimeout(() => {
      setMessageVisible(true);
    }, 50); // Small delay to ensure CSS transition applies
  };

  const handleCopy = () => {
    copy(message || "");
  };

  return (
  <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col gap-3 sm:gap-4 max-w-md w-full mx-auto">
      {/* Language and Theme Toggles */}
      <div className="flex justify-end -mt-2 sm:-mt-4 -mr-2 sm:-mr-4">
        <div className="flex space-x-1 sm:space-x-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      {isLoading ? (
  <div className="text-center text-gray-600 dark:text-gray-300 text-base sm:text-lg">
          <p>{t("loadingMessage")}</p>
        </div>
      ) : (
        <>
          {statusCode === 404 && (
            <p className="text-red-600 dark:text-red-400 mb-3 sm:mb-4 text-center text-base sm:text-lg">
              {t("messageNotFoundOrAlreadyRead")}
            </p>
          )}

          {statusCode === 410 && (
            <p className="text-red-600 dark:text-red-400 mb-3 sm:mb-4 text-center text-base sm:text-lg">
              {t("messageExpired")}
            </p>
          )}

          {error && !statusCode && (
            <p className="text-red-600 dark:text-red-400 mb-3 sm:mb-4 text-center text-base sm:text-lg">{error}</p>
          )}

          {showConfirmation && message && (
            <div className="p-3 sm:p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-lg flex flex-col items-center gap-3 sm:gap-4">
              <p className="text-lg font-semibold text-center">
                {t("oneTimeMessageConfirmation")}
              </p>
              <button
                onClick={handleRevealMessage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 sm:py-3 px-3 sm:px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-yellow-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 text-base sm:text-lg"
              >
                {t("revealMessage")}
              </button>
            </div>
          )}

          {message && !showConfirmation && (
            <div className={`p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-opacity duration-500 ${messageVisible ? "opacity-100" : "opacity-0"}`}>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("oneTimeMessage")}
              </p>
              <p className="mt-1 sm:mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words text-sm sm:text-base">
                {message}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 sm:py-3 px-3 sm:px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cancomRed focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 mt-3 sm:mt-4 text-base sm:text-lg"
              >
                {isCopied ? t("copied") : t("copy")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReadView;
