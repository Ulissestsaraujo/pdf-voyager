import { useEffect, useState } from "react";

// Helper function to detect Safari
const isSafari = (): boolean => {
  if (typeof document === "undefined") return false; // SSR guard
  return (
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
    "hasStorageAccess" in document
  );
};

export const useStorageAccess = () => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);

  useEffect(() => {
    const checkStorageAccess = async () => {
      if (!isSafari()) {
        setHasAccess(true);
        return;
      }

      try {
        const hasAccess = await document.hasStorageAccess();
        setHasAccess(hasAccess);
        setNeedsPermission(!hasAccess);
      } catch (error) {
        console.error("Storage access check failed:", error);
        setNeedsPermission(true);
      }
    };

    checkStorageAccess();
  }, []);

  const requestAccess = async (): Promise<boolean> => {
    if (!isSafari()) return true;

    try {
      await document.requestStorageAccess();
      setHasAccess(true);
      setNeedsPermission(false);
      return true;
    } catch (error) {
      console.error("Storage access request failed:", error);
      setNeedsPermission(true);
      return false;
    }
  };

  return { hasAccess, needsPermission, requestAccess };
};
