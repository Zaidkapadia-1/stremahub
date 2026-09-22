import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function ProtectedRoute({ children }) {
  const { account } = useUser();
  const location = useLocation();

  if (!account?.token) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children;
}
