// hooks/useDebouncedCallback.ts
import { useCallback } from "react";
import debounce from "lodash.debounce";

export const useDebouncedCallback = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: any[]) => void,
  delay: number
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounce(callback, delay), []);
};
