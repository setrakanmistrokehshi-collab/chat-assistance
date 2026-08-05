import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
