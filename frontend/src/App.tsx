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

// API base URL for backend calls
export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

// Dynamic host detection for generating QR codes / links
export const publicHost =
  window.location.hostname === "localhost"
    ? window.location.origin
    : import.meta.env.VITE_PUBLIC_HOST || `http://${window.location.hostname}:8080`;

console.log("Using API base URL:", apiBaseUrl);
console.log("Using Public Host:", publicHost);

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
