// components/Layout.tsx
import { ThemeToggle } from "./ThemeToggle";
export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <nav className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-end">
        <ThemeToggle />
      </nav>
      <main>{children}</main>
    </div>
  );
};
