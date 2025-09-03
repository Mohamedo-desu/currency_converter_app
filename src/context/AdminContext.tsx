import {
  deleteStoredValues,
  getStoredValues,
  saveSecurely,
} from "@/store/storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminContextType {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAdminStatus: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = () => {
    try {
      const { adminToken, adminExpiry } = getStoredValues([
        "adminToken",
        "adminExpiry",
      ]);

      if (adminToken && adminExpiry) {
        const expiryTime = new Date(adminExpiry).getTime();
        const currentTime = new Date().getTime();

        if (currentTime < expiryTime) {
          setIsAdmin(true);
        } else {
          // Token expired, clean up
          deleteStoredValues(["adminToken", "adminExpiry"]);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store admin session (expires in 24 hours)
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 24);

        saveSecurely([
          { key: "adminToken", value: data.token || "admin-authenticated" },
          { key: "adminExpiry", value: expiryTime.toISOString() },
        ]);

        setIsAdmin(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    deleteStoredValues(["adminToken", "adminExpiry"]);
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, checkAdminStatus }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
