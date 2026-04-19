import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

function Inner() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--cream)' }}>
      <div style={{ width:36, height:36, border:'3px solid var(--sand)', borderTopColor:'var(--brown)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );
  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>;
}
