import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../helpers/apiConnector";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white py-4 px-6 shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold hover:text-gray-200 transition"
        >
          PDF Voyager
        </Link>
        <div className="flex space-x-6">
          {isAuthenticated && (
            <>
              <Link
                to="/"
                className="hover:bg-blue-700 px-4 py-2 rounded transition"
              >
                Home
              </Link>
              <Link
                to="/upload"
                className="hover:bg-blue-700 px-4 py-2 rounded transition"
              >
                Upload
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="hover:bg-blue-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:bg-blue-700 px-4 py-2 rounded transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:bg-blue-700 px-4 py-2 rounded transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
