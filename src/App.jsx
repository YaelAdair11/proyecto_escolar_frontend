import { useEffect, useState } from 'react';
import './App.css';

function App() {
  // Estado para controlar qué pantalla vemos: 'alumnos' o 'materias'
  const [vista, setVista] = useState('alumnos');

  // --- LÓGICA DE ALUMNOS ---
  const [alumnos, setAlumnos] = useState([]);
  const [nuevoAlumno, setNuevoAlumno] = useState({
    matricula: '', nombre: '', apellido: '', fecha_nacimiento: '', direccion: ''
  });

  // --- LÓGICA DE MATERIAS ---
  const [materias, setMaterias] = useState([]);
  const [nuevaMateria, setNuevaMateria] = useState({
    nombre_materia: '', clave_materia: '', descripcion: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (vista === 'alumnos') cargarAlumnos();
    if (vista === 'materias') cargarMaterias();
  }, [vista]);

  const cargarAlumnos = () => {
    fetch('http://localhost:3001/api/alumnos')
      .then(res => res.json())
      .then(data => setAlumnos(data))
      .catch(err => console.error(err));
  };

  const cargarMaterias = () => {
    fetch('http://localhost:3001/api/materias')
      .then(res => res.json())
      .then(data => setMaterias(data))
      .catch(err => console.error(err));
  };

  // Manejadores de Formularios
  const handleAlumnoChange = (e) => setNuevoAlumno({ ...nuevoAlumno, [e.target.name]: e.target.value });
  const handleMateriaChange = (e) => setNuevaMateria({ ...nuevaMateria, [e.target.name]: e.target.value });

  const submitAlumno = (e) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/alumnos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoAlumno)
    }).then(() => {
      alert('Alumno registrado');
      setNuevoAlumno({ matricula: '', nombre: '', apellido: '', fecha_nacimiento: '', direccion: '' });
      cargarAlumnos();
    });
  };

  const submitMateria = (e) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/materias', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaMateria)
    }).then(() => {
      alert('Materia registrada');
      setNuevaMateria({ nombre_materia: '', clave_materia: '', descripcion: '' });
      cargarMaterias();
    });
  };

  return (
    <div className="container" style={{maxWidth: '800px', margin: '0 auto'}}>
      <h1>Panel Escolar</h1>
      
      {/* NAVEGACIÓN SIMPLE */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={() => setVista('alumnos')} style={{ backgroundColor: vista === 'alumnos' ? '#646cff' : '#333' }}>
          Gestionar Alumnos
        </button>
        <button onClick={() => setVista('materias')} style={{ backgroundColor: vista === 'materias' ? '#646cff' : '#333' }}>
          Gestionar Materias
        </button>
      </div>

      {/* VISTA DE ALUMNOS */}
      {vista === 'alumnos' && (
        <div>
          <h2>Registro de Alumnos</h2>
          <form onSubmit={submitAlumno} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{display: 'flex', gap: '5px'}}>
              <input name="matricula" placeholder="Matrícula" value={nuevoAlumno.matricula} onChange={handleAlumnoChange} required />
              <input name="nombre" placeholder="Nombre(s)" value={nuevoAlumno.nombre} onChange={handleAlumnoChange} required />
              <input name="apellido" placeholder="Apellido(s)" value={nuevoAlumno.apellido} onChange={handleAlumnoChange} required />
            </div>
            <div style={{display: 'flex', gap: '5px'}}>
              <input type="date" name="fecha_nacimiento" value={nuevoAlumno.fecha_nacimiento} onChange={handleAlumnoChange} />
              <input name="direccion" placeholder="Dirección" style={{flex:1}} value={nuevoAlumno.direccion} onChange={handleAlumnoChange} />
            </div>
            <button type="submit">Guardar Alumno</button>
          </form>

          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{backgroundColor: '#333', color: 'white'}}><th>Matrícula</th><th>Nombre</th><th>Apellido</th></tr>
            </thead>
            <tbody>
              {alumnos.map(a => (
                <tr key={a.id}><td>{a.matricula}</td><td>{a.nombre}</td><td>{a.apellido}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA DE MATERIAS */}
      {vista === 'materias' && (
        <div>
          <h2>Registro de Materias</h2>
          <form onSubmit={submitMateria} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <input name="nombre_materia" placeholder="Nombre de la Materia (ej. Matemáticas I)" value={nuevaMateria.nombre_materia} onChange={handleMateriaChange} required />
            <input name="clave_materia" placeholder="Clave (ej. MAT-101)" value={nuevaMateria.clave_materia} onChange={handleMateriaChange} required />
            <textarea name="descripcion" placeholder="Descripción breve..." value={nuevaMateria.descripcion} onChange={handleMateriaChange} />
            <button type="submit" style={{backgroundColor: '#2e7d32'}}>Guardar Materia</button>
          </form>

          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{backgroundColor: '#333', color: 'white'}}><th>Clave</th><th>Materia</th><th>Descripción</th></tr>
            </thead>
            <tbody>
              {materias.map(m => (
                <tr key={m.id}><td>{m.clave_materia}</td><td>{m.nombre_materia}</td><td>{m.descripcion}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;