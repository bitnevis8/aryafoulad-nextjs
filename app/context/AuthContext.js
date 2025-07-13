'use client';
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // تابع برای دریافت اطلاعات کاربر از سرور
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success && data.data) {
        setUser(data.data);
        if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(data.data));
      } else {
        setUser(null);
        if (typeof window !== 'undefined') localStorage.removeItem('user');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      if (typeof window !== 'undefined') localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // در شروع، تلاش می‌کنیم از localStorage بخوانیم
    const localUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false); // فرض می‌کنیم داده‌ی localStorage معتبر است تا fetch انجام شود
    }
    // حالا، اطلاعات کاربر را از سرور می‌گیریم تا مطمئن شویم به روز است
    fetchUserData();
  }, []);

  // هر بار که user تغییر کرد، localStorage را sync کن (و بالعکس)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser: fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 