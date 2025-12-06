import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  
  // Estados para el formulario
  const [nuevoAlumno, setNuevoAlumno] = useState({
    matricula: '',
    nombre: '',
    apellido: ''
  });

  // Función para cargar alumnos (GET)
  const cargarAlumnos = () => {
    fetch('http://localhost:3001/api/alumnos')
      .then(response => response.json())
      .then(data => setAlumnos(data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  // Función para capturar lo que escribe el usuario
  const handleChange = (e) => {
    setNuevoAlumno({
      ...nuevoAlumno,
      [e.target.name]: e.target.value
    });
  };

  // Función para enviar el formulario (POST)
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    fetch('http://localhost:3001/api/alumnos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoAlumno),
    })
      .then(response => response.json())
      .then(() => {
        alert('Alumno registrado correctamente');
        setNuevoAlumno({ matricula: '', nombre: '', apellido: '' }); // Limpiar formulario
        cargarAlumnos(); // Recargar la tabla para ver el nuevo alumno
      })
      .catch(error => console.error('Error al registrar:', error));
  };

  return (
    <div className="container">
      <h1>Panel de Maestros</h1>

      {/* FORMULARIO DE REGISTRO */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h3>Registrar Nuevo Alumno</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            name="matricula" 
            placeholder="Matrícula" 
            value={nuevoAlumno.matricula} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="nombre" 
            placeholder="Nombre(s)" 
            value={nuevoAlumno.nombre} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="apellido" 
            placeholder="Apellido(s)" 
            value={nuevoAlumno.apellido} 
            onChange={handleChange} 
            required 
          />
          <button type="submit">Guardar</button>
        </form>
      </div>

      {/* TABLA DE ALUMNOS */}
      <h2>Lista de Alumnos</h2>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nombre</th>
            <th>Apellido</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((alumno) => (
            <tr key={alumno.id}>
              <td>{alumno.matricula}</td>
              <td>{alumno.nombre}</td>
              <td>{alumno.apellido}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;