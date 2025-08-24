import React from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateForm from "./components/CreateForm";
import ReadView from "./components/ReadView";
// LanguageSelector and ThemeToggle will be imported and used in CreateForm and ReadView
// import LanguageSelector from "./components/LanguageSelector";
// import ThemeToggle from "./components/ThemeToggle";
import ToastContainer from "./components/ToastContainer";
import i18n from "./i18n";

// In development, the API URL is passed in as an environment variable from docker-compose-dev.yml
// In production, API calls are relative to the same host, so the base URL is an empty string.
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

// The VITE_PUBLIC_HOST env var provides an override for the public-facing URL.
// If it's not set, we default to the browser's current origin, which is the
// most reliable way to construct the shareable link.
export const publicHost = import.meta.env.VITE_PUBLIC_HOST || window.location.origin;

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 justify-center items-center">
          {/* Main Content */}
          <main className="container mx-auto"> {/* Reverted styling */}
            <Routes>
              <Route path="/" element={<CreateForm />} />
              <Route path="/create" element={<CreateForm />} />
              <Route path="/read/:token" element={<ReadView />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
