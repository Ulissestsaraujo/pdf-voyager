import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthActions } from "../hooks/useAuthActions";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { handleLogout: logout } = useAuthActions();
  const { isAuthenticated } = useAuth();

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="h-20 bg-slate-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-4 px-6 shadow-sm fixed w-full top-0 z-50 transition-colors duration-200 border-b border-slate-200 dark:border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold text-slate-800 dark:text-gray-200 hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
        >
          PDF Voyager
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className="px-4 py-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/upload"
                className="px-4 py-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
              >
                Upload
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
