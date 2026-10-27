import { createContext, useContext } from 'react';

export const GearShopContext = createContext(null);
export default function useGearShopContext() {
  const value = useContext(GearShopContext);
  if (!value) throw new Error('A loja precisa estar dentro da experiência do Giro.');
  return value;
}
