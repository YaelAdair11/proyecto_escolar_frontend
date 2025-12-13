// src/vistas/Login.jsx
import { useState } from 'react';
import { School, Lock } from 'lucide-react';
import { Input } from '../componentes/ComponentesReusables'; 

const Login = ({ onLogin }) => {
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/login', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    })
    .then(res => {
      if (!res.ok) throw new Error('Credenciales inválidas');
      return res.json();
    })
    .then(data => {
      onLogin(data.usuario); 
    })
    .catch(() => setError('Correo o contraseña incorrectos'));
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
      <div className="card" style={{ width: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <School size={48} color="#2563eb" />
          <h2 style={{ color: '#1e293b' }}>Bienvenido al Portal</h2>
          <p style={{ color: '#64748b' }}>Ingresa tus credenciales para continuar</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Input label="Correo Electrónico" type="email" value={creds.email} onChange={e => setCreds({...creds, email: e.target.value})} required />
          <Input label="Contraseña" type="password" value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} required style={{marginTop: '15px'}} />
          {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '0.9em' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '20px' }}>
          <Lock size={16} style={{ marginRight: '8px' }}/> Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;