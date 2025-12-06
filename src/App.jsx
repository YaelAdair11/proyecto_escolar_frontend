import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [vista, setVista] = useState('alumnos');

  // --- ESTADOS DE DATOS ---
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  // --- FORMULARIOS ---
  const [nuevoAlumno, setNuevoAlumno] = useState({ matricula: '', nombre: '', apellido: '', fecha_nacimiento: '', direccion: '' });
  const [nuevaMateria, setNuevaMateria] = useState({ nombre_materia: '', clave_materia: '', descripcion: '' });
  const [nuevoTurno, setNuevoTurno] = useState({ nombre_turno: '' });
  const [nuevoMaestro, setNuevoMaestro] = useState({ nombre: '', apellido: '', email: '', telefono: '' });
  
  // Estado especial para Asignaciones (guarda IDs)
  const [nuevaAsignacion, setNuevaAsignacion] = useState({ maestro_id: '', materia_id: '', turno_id: '' });

  // --- CARGA INICIAL ---
  useEffect(() => {
    cargarData('materias', setMaterias);
    cargarData('turnos', setTurnos);
    cargarData('maestros', setMaestros);
  }, []);

  // Carga dinámica según la vista
  useEffect(() => {
    if (vista === 'alumnos') cargarData('alumnos', setAlumnos);
    if (vista === 'asignaciones') cargarData('asignaciones', setAsignaciones);
  }, [vista]);

  const cargarData = (entidad, setter) => {
    fetch(`http://localhost:3001/api/${entidad}`)
      .then(res => res.json())
      .then(data => setter(data))
      .catch(err => console.error(err));
  };

  const handleChange = (e, setter, estado) => {
    setter({ ...estado, [e.target.name]: e.target.value });
  };

  const enviarFormulario = (e, entidad, data, setterClean, estadoClean, refreshSetter) => {
    e.preventDefault();
    fetch(`http://localhost:3001/api/${entidad}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(() => {
      alert('Registro exitoso');
      setterClean(estadoClean);
      cargarData(entidad, refreshSetter);
    });
  };

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1>Sistema de Gestión Escolar</h1>
      
      {/* NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['alumnos', 'maestros', 'materias', 'turnos', 'asignaciones'].map(v => (
          <button 
            key={v} onClick={() => setVista(v)}
            style={{ backgroundColor: vista === v ? '#007bff' : '#333', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* --- VISTA ALUMNOS --- */}
      {vista === 'alumnos' && (
        <div>
          <h2>Gestionar Alumnos</h2>
          <form onSubmit={(e) => enviarFormulario(e, 'alumnos', nuevoAlumno, setNuevoAlumno, { matricula: '', nombre: '', apellido: '', fecha_nacimiento: '', direccion: '' }, setAlumnos)} style={formStyle}>
            <input name="matricula" placeholder="Matrícula" value={nuevoAlumno.matricula} onChange={(e) => handleChange(e, setNuevoAlumno, nuevoAlumno)} required />
            <input name="nombre" placeholder="Nombre" value={nuevoAlumno.nombre} onChange={(e) => handleChange(e, setNuevoAlumno, nuevoAlumno)} required />
            <input name="apellido" placeholder="Apellido" value={nuevoAlumno.apellido} onChange={(e) => handleChange(e, setNuevoAlumno, nuevoAlumno)} required />
            <button type="submit" style={btnStyle}>Guardar Alumno</button>
          </form>
          {renderTable(alumnos, ['matricula', 'nombre', 'apellido'])}
        </div>
      )}

      {/* --- VISTA MAESTROS --- */}
      {vista === 'maestros' && (
        <div>
          <h2>Gestionar Maestros</h2>
          <form onSubmit={(e) => enviarFormulario(e, 'maestros', nuevoMaestro, setNuevoMaestro, { nombre: '', apellido: '', email: '', telefono: '' }, setMaestros)} style={formStyle}>
            <input name="nombre" placeholder="Nombre" value={nuevoMaestro.nombre} onChange={(e) => handleChange(e, setNuevoMaestro, nuevoMaestro)} required />
            <input name="apellido" placeholder="Apellido" value={nuevoMaestro.apellido} onChange={(e) => handleChange(e, setNuevoMaestro, nuevoMaestro)} required />
            <input name="email" placeholder="Email" value={nuevoMaestro.email} onChange={(e) => handleChange(e, setNuevoMaestro, nuevoMaestro)} />
            <button type="submit" style={btnStyle}>Guardar Maestro</button>
          </form>
          {renderTable(maestros, ['nombre', 'apellido', 'email'])}
        </div>
      )}

      {/* --- VISTA MATERIAS --- */}
      {vista === 'materias' && (
        <div>
          <h2>Gestionar Materias</h2>
          <form onSubmit={(e) => enviarFormulario(e, 'materias', nuevaMateria, setNuevaMateria, { nombre_materia: '', clave_materia: '', descripcion: '' }, setMaterias)} style={formStyle}>
            <input name="clave_materia" placeholder="Clave" value={nuevaMateria.clave_materia} onChange={(e) => handleChange(e, setNuevaMateria, nuevaMateria)} required />
            <input name="nombre_materia" placeholder="Materia" value={nuevaMateria.nombre_materia} onChange={(e) => handleChange(e, setNuevaMateria, nuevaMateria)} required />
            <button type="submit" style={btnStyle}>Guardar Materia</button>
          </form>
          {renderTable(materias, ['clave_materia', 'nombre_materia'])}
        </div>
      )}

      {/* --- VISTA TURNOS --- */}
      {vista === 'turnos' && (
        <div>
          <h2>Gestionar Turnos</h2>
          <form onSubmit={(e) => enviarFormulario(e, 'turnos', nuevoTurno, setNuevoTurno, { nombre_turno: '' }, setTurnos)} style={formStyle}>
            <input name="nombre_turno" placeholder="Nombre Turno" value={nuevoTurno.nombre_turno} onChange={(e) => handleChange(e, setNuevoTurno, nuevoTurno)} required />
            <button type="submit" style={btnStyle}>Guardar Turno</button>
          </form>
          {renderTable(turnos, ['nombre_turno'])}
        </div>
      )}

      {/* --- VISTA ASIGNACIONES (LA IMPORTANTE) --- */}
      {vista === 'asignaciones' && (
        <div>
          <h2>Asignación de Carga Académica</h2>
          <p>Vincula un Maestro con una Materia y un Turno.</p>
          
          <form onSubmit={(e) => enviarFormulario(e, 'asignaciones', nuevaAsignacion, setNuevaAsignacion, { maestro_id: '', materia_id: '', turno_id: '' }, setAsignaciones)} style={formStyle}>
            
            <select name="maestro_id" value={nuevaAsignacion.maestro_id} onChange={(e) => handleChange(e, setNuevaAsignacion, nuevaAsignacion)} required style={inputStyle}>
              <option value="">-- Selecciona Maestro --</option>
              {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}
            </select>

            <select name="materia_id" value={nuevaAsignacion.materia_id} onChange={(e) => handleChange(e, setNuevaAsignacion, nuevaAsignacion)} required style={inputStyle}>
              <option value="">-- Selecciona Materia --</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre_materia}</option>)}
            </select>

            <select name="turno_id" value={nuevaAsignacion.turno_id} onChange={(e) => handleChange(e, setNuevaAsignacion, nuevaAsignacion)} required style={inputStyle}>
              <option value="">-- Selecciona Turno --</option>
              {turnos.map(t => <option key={t.id} value={t.id}>{t.nombre_turno}</option>)}
            </select>

            <button type="submit" style={btnStyle}>Asignar</button>
          </form>

          {/* Tabla de asignaciones con nombres reales */}
          <table border="1" cellPadding="10" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
            <thead>
              <tr style={{background:'#333', color: 'white'}}>
                <th>ID</th><th>Maestro</th><th>Materia</th><th>Turno</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  {/* Accedemos a los objetos anidados gracias al Join del backend */}
                  <td>{a.maestros ? `${a.maestros.nombre} ${a.maestros.apellido}` : 'Sin datos'}</td>
                  <td>{a.materias ? a.materias.nombre_materia : 'Sin datos'}</td>
                  <td>{a.turnos ? a.turnos.nombre_turno : 'Sin datos'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Estilos simples para no repetir código
const formStyle = { display: 'flex', gap: '10px', marginBottom: '20px', background: '#f4f4f4', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' };
const inputStyle = { padding: '8px', flex: 1 };
const btnStyle = { background: '#28a745', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' };

// Función auxiliar para renderizar tablas simples
const renderTable = (data, columns) => (
  <table border="1" cellPadding="10" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
    <thead>
      <tr style={{background:'#333', color: 'white'}}>
        {columns.map(c => <th key={c} style={{textTransform: 'capitalize'}}>{c.replace('_', ' ')}</th>)}
      </tr>
    </thead>
    <tbody>
      {data.map(row => (
        <tr key={row.id}>
          {columns.map(col => <td key={col}>{row[col]}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

export default App;