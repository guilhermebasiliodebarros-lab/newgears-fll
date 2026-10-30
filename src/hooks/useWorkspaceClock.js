import { useEffect, useState } from 'react';

export default function useWorkspaceClock() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    const refresh = () => { if (!document.hidden) setNow(Date.now()); };
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  return now;
}
