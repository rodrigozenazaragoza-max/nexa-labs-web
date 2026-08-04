'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { CartItem, Product, ProductVariant } from './types';
import { lineKey, itemUnitPrice } from './cart-utils';
import { siteConfig } from './site-config';

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant | null, qty?: number) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  totalMxn: number; // subtotal, sin descuento
  discountMxn: number;
  finalTotalMxn: number; // subtotal - descuento
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  couponInput: string;
  setCouponInput: (v: string) => void;
  appliedCoupon: string | null;
  couponMsg: string | null;
  applyCoupon: () => void;
  clearCoupon: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'peptides-store-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        // ignore malformed cart data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(product: Product, variant: ProductVariant | null, qty = 1) {
    const key = lineKey(product, variant);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { key, product, variant, qty }];
    });
    setIsOpen(true);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function setQty(key: string, qty: number) {
    if (qty <= 0) return removeItem(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  }

  function clear() {
    setItems([]);
    clearCoupon();
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (code === siteConfig.newsletter.discountCode) {
      setAppliedCoupon(code);
      setCouponMsg(`Código aplicado: -${siteConfig.newsletter.discountPercent}%`);
    } else {
      setAppliedCoupon(null);
      setCouponMsg('Código no válido.');
    }
  }

  function clearCoupon() {
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponMsg(null);
  }

  const totalMxn = useMemo(
    () => items.reduce((sum, i) => sum + itemUnitPrice(i) * i.qty, 0),
    [items]
  );
  const discountMxn = useMemo(
    () =>
      appliedCoupon === siteConfig.newsletter.discountCode
        ? totalMxn * (siteConfig.newsletter.discountPercent / 100)
        : 0,
    [appliedCoupon, totalMxn]
  );
  const finalTotalMxn = totalMxn - discountMxn;
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, setQty, clear, totalMxn, discountMxn, finalTotalMxn, count,
        isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
        couponInput, setCouponInput, appliedCoupon, couponMsg, applyCoupon, clearCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
