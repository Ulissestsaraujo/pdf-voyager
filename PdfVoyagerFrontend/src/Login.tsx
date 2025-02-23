import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "./hooks/useAuthActions";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { handleLogin: login } = useAuthActions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/");
    } else {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96 border border-slate-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-6 text-center">
          Login
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2 text-slate-700 dark:text-gray-300"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-800 dark:text-gray-200 focus:ring-2 focus:ring-slate-500 dark:focus:ring-indigo-500"
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2 text-slate-700 dark:text-gray-300"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-800 dark:text-gray-200 focus:ring-2 focus:ring-slate-500 dark:focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white dark:text-white p-2 rounded-lg transition-colors duration-200"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-slate-700 dark:text-gray-400">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-slate-800 dark:text-indigo-400 hover:underline"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
