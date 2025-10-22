import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const RequireAuth: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ORDER = { viewer: 1, manager: 2, admin: 3 } as const;
export const RoleGate: React.FC<{min: keyof typeof ORDER, children: React.ReactNode}> = ({ min, children }) => {
  const { user } = useAuth();
  if (!user) return null;
  return ORDER[user.role] >= ORDER[min] ? <>{children}</> : null;
};
