import { ReactNode, useEffect, useState } from "react";
import { useStorageAccess } from "./useStorageAccess";

interface StorageGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const StorageGate = ({ children, fallback }: StorageGateProps) => {
  const { hasAccess, needsPermission, requestAccess } = useStorageAccess();
  const [showButton, setShowButton] = useState<boolean>(false);

  useEffect(() => {
    if (needsPermission) {
      const timeout = setTimeout(() => setShowButton(true), 300);
      return () => clearTimeout(timeout);
    }
  }, [needsPermission]);

  const handleClick = async () => {
    const success = await requestAccess();
    if (!success) {
      // Handle denied access
      alert(
        "Cookie access is required for full functionality. Please enable cookies."
      );
    }
  };

  if (hasAccess) return <>{children}</>;

  return (
    <>
      {showButton && (
        <div className="storage-permission-banner">
          <p>
            This application requires cookie access to maintain your session.
          </p>
          <button
            onClick={handleClick}
            className="storage-access-button"
            type="button"
          >
            Grant Cookie Access
          </button>
        </div>
      )}
      {fallback}
    </>
  );
};
