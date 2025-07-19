import { useMsal } from '@azure/msal-react';
import React from 'react'
import { useNavigate } from 'react-router-dom';

export const Logout = () => {
const { instance } = useMsal();
const navigate = useNavigate();

  const handleLogout = () => {
    instance.logoutRedirect();
    navigate('/login');
  };

  return (
    <>
    <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">
      Logout
    </button>
    </>
  )
}
