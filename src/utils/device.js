export const isXboxConsole = () => {
  if (typeof window === 'undefined' || !navigator) return false;
  const ua = navigator.userAgent || '';
  return /xbox/i.test(ua);
};
