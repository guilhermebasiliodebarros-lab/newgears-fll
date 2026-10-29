import { useCallback, useEffect, useState } from 'react';
import { wishlistIds, wishlistKey } from '../utils/shopWishlist';
import { browserStorage, isStorageUnavailable } from '../utils/browserStorage';

export default function useGearWishlist(user) {
  const key = wishlistKey(user);
  const read = useCallback(() => { try { return wishlistIds(JSON.parse(browserStorage.getItem(key))); } catch { return []; } }, [key]);
  const [state, setState] = useState(() => ({ key, ids: read(), error: '' }));
  const ids = state.key === key ? state.ids : read();
  const save = (next) => {
    const normalized = wishlistIds(next);
    let error = '';
    try { if (key) browserStorage.setItem(key, JSON.stringify(normalized)); if (isStorageUnavailable()) error = 'Seus desejos ficam nesta aba porque o navegador não conseguiu guardá-los.'; }
    catch { error = 'Seus desejos ficam nesta aba porque o navegador não conseguiu guardá-los.'; }
    setState({ key, ids: normalized, error });
  };
  useEffect(() => {
    const sync = (event) => { if (event.key === key || event.key === null) setState({ key, ids: read(), error: '' }); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key, read]);
  return { ids, error: state.key === key ? state.error : '', toggle: (id) => save(ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]), add: (values) => save([...ids, ...values]), prioritize: (id) => save([id, ...ids.filter((value) => value !== id)]) };
}
