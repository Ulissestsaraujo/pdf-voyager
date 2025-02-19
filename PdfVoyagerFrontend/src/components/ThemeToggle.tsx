// components/ThemeToggle.tsx
import { useTheme } from "../context/ThemeContext";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <span className="text-xl">🌞</span> // Sun icon for dark mode
      ) : (
        <span className="text-xl">🌙</span> // Moon icon for light mode
      )}
    </button>
  );
};
