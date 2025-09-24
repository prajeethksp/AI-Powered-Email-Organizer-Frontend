import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, ...rest }) => {
  // Check if user is authenticated (You can replace this with your authentication logic)
  const isAuthenticated = true; // Replace with your actual authentication logic

  return (
    <Route
      {...rest}
      element={isAuthenticated ? <Element /> : <Navigate to="/auth" replace />}
    />
  );
};

export default PrivateRoute;
