import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  
  // 1. Agregamos los campos al estado inicial
  const [nuevoAlumno, setNuevoAlumno] = useState({
    matricula: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    direccion: ''
  });

  const cargarAlumnos = () => {
    fetch('http://localhost:3001/api/alumnos')
      .then(response => response.json())
      .then(data => setAlumnos(data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const handleChange = (e) => {
    setNuevoAlumno({
      ...nuevoAlumno,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:3001/api/alumnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoAlumno),
    })
      .then(response => response.json())
      .then(() => {
        alert('Alumno registrado correctamente');
        // Limpiamos todo el formulario
        setNuevoAlumno({ matricula: '', nombre: '', apellido: '', fecha_nacimiento: '', direccion: '' });
        cargarAlumnos();
      })
      .catch(error => console.error('Error al registrar:', error));
  };

  return (
    <div className="container">
      <h1>Panel de Maestros</h1>

      {/* FORMULARIO COMPLETO */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h3>Registrar Nuevo Alumno</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <input 
            type="text" name="matricula" placeholder="Matrícula" 
            value={nuevoAlumno.matricula} onChange={handleChange} required 
          />
          <input 
            type="text" name="nombre" placeholder="Nombre(s)" 
            value={nuevoAlumno.nombre} onChange={handleChange} required 
          />
          <input 
            type="text" name="apellido" placeholder="Apellido(s)" 
            value={nuevoAlumno.apellido} onChange={handleChange} required 
          />
          <label style={{textAlign: 'left', fontSize: '12px'}}>Fecha de Nacimiento:</label>
          <input 
            type="date" name="fecha_nacimiento" 
            value={nuevoAlumno.fecha_nacimiento} onChange={handleChange} 
          />
          <input 
            type="text" name="direccion" placeholder="Dirección" 
            value={nuevoAlumno.direccion} onChange={handleChange} 
          />

          <button type="submit">Guardar Alumno</button>
        </form>
      </div>

      {/* TABLA COMPLETA */}
      <h2>Lista de Alumnos</h2>
      <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha Nac.</th>
            <th>Dirección</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((alumno) => (
            <tr key={alumno.id}>
              <td>{alumno.matricula}</td>
              <td>{alumno.nombre}</td>
              <td>{alumno.apellido}</td>
              <td>{alumno.fecha_nacimiento}</td>
              <td>{alumno.direccion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;