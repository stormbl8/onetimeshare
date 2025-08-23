import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast } from '../utils/toast';

export const useClipboard = (timeout = 2000) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      showToast(t('copiedToClipboard'), 'success');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Prevent scrolling to bottom of page
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }, [t, timeout]);

  return { isCopied, copy };
};