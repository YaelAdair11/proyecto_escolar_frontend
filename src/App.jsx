import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, GraduationCap, Clock, BookOpen, School } from 'lucide-react'; // Si no instalaste lucide, borra esta línea y los iconos
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
  const initialAlumno = { matricula: '', nombre: '', apellido: '', fecha_nacimiento: '', direccion: '' };
  const initialMateria = { nombre_materia: '', clave_materia: '', descripcion: '' };
  const initialTurno = { nombre_turno: '' };
  const initialMaestro = { nombre: '', apellido: '', email: '', telefono: '' };
  const initialAsignacion = { maestro_id: '', materia_id: '', turno_id: '' };

  const [nuevoAlumno, setNuevoAlumno] = useState(initialAlumno);
  const [nuevaMateria, setNuevaMateria] = useState(initialMateria);
  const [nuevoTurno, setNuevoTurno] = useState(initialTurno);
  const [nuevoMaestro, setNuevoMaestro] = useState(initialMaestro);
  const [nuevaAsignacion, setNuevaAsignacion] = useState(initialAsignacion);

  // --- CARGA INICIAL ---
  useEffect(() => {
    // Precargamos los catálogos necesarios para los selects
    cargarData('materias', setMaterias);
    cargarData('turnos', setTurnos);
    cargarData('maestros', setMaestros);
  }, []);

  useEffect(() => {
    if (vista === 'alumnos') cargarData('alumnos', setAlumnos);
    if (vista === 'asignaciones') cargarData('asignaciones', setAsignaciones);
  }, [vista]);

  const cargarData = (entidad, setter) => {
    fetch(`http://localhost:8080/api/${entidad}`)
      .then(res => res.json())
      .then(data => setter(data))
      .catch(err => console.error(err));
  };

  const handleChange = (e, setter, estado) => {
    setter({ ...estado, [e.target.name]: e.target.value });
  };

  const enviarFormulario = (e, entidad, data, setterClean, estadoClean, refreshSetter) => {
    e.preventDefault();
    fetch(`http://localhost:8080/api/${entidad}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(() => {
      // Opcional: Usar un toast/notificación más elegante en lugar de alert
      alert('Registro guardado correctamente'); 
      setterClean(estadoClean);
      cargarData(entidad, refreshSetter);
    });
  };

  // --- COMPONENTES UI REUTILIZABLES ---
  
  const PageHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '30px' }}>
      <h1 className="header-title">{title}</h1>
      <p className="header-subtitle">{subtitle}</p>
    </div>
  );

  const Table = ({ data, columns }) => (
    <div className="card table-container">
      <table>
        <thead>
          <tr>
            {columns.map(c => <th key={c}>{c.replace('_', ' ')}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map(row => (
            <tr key={row.id}>
              {columns.map(col => <td key={col}>{row[col]}</td>)}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                No hay registros disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // --- RENDERIZADO PRINCIPAL ---

  return (
    <div className="dashboard-layout">
      
      {/* SIDEBAR DE NAVEGACIÓN */}
      <aside className="sidebar">
        <div className="brand">
          <School size={28} /> {/* Icono */}
          <span>EduPortal</span>
        </div>
        
        <nav className="nav-menu">
          <NavButton active={vista === 'alumnos'} onClick={() => setVista('alumnos')} icon={<Users size={20}/>} label="Alumnos" />
          <NavButton active={vista === 'maestros'} onClick={() => setVista('maestros')} icon={<GraduationCap size={20}/>} label="Docentes" />
          <NavButton active={vista === 'materias'} onClick={() => setVista('materias')} icon={<BookOpen size={20}/>} label="Materias" />
          <NavButton active={vista === 'turnos'} onClick={() => setVista('turnos')} icon={<Clock size={20}/>} label="Turnos" />
          <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0'}}></div>
          <NavButton active={vista === 'asignaciones'} onClick={() => setVista('asignaciones')} icon={<LayoutDashboard size={20}/>} label="Carga Académica" />
        </nav>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="main-content">
        
        {vista === 'alumnos' && (
          <>
            <PageHeader title="Directorio de Alumnos" subtitle="Gestiona la información y matrícula de los estudiantes." />
            <div className="card">
              <h3 style={{marginTop:0, marginBottom: '20px'}}>Nuevo Estudiante</h3>
              <form onSubmit={(e) => enviarFormulario(e, 'alumnos', nuevoAlumno, setNuevoAlumno, initialAlumno, setAlumnos)}>
                <div className="form-grid">
                  <Input label="Matrícula" name="matricula" value={nuevoAlumno.matricula} onChange={(e) => handleChange(e, setNuevoAlumno, nuevoAlumno)} required />
                  <Input label="Nombre" name="nombre" value={nuevoAlumno.nombre} onChange={(e) => handleChange(e, setNuevoAlumno, nuevoAlumno)} required />
                  <Input label="Apellido" name="apellido" value={nuevoAlumno.apellido} onChange={(e) => handleChange(e, setNuevoAlumno, nuevoAlumno)} required />
                  <Input label="Dirección" name="direccion" value={nuevoAlumno.direccion} onChange={(e) => handleChange(e, setNuevoAlumno, nuevoAlumno)} />
                  <Input label="Fecha Nacimiento" type="date" name="fechaNacimiento" value={nuevoAlumno.fecha_nacimiento} onChange={(e) => handleChange(e, setNuevoAlumno, nuevoAlumno)} />
                </div>
                <button type="submit" className="btn-primary">Registrar Alumno</button>
              </form>
            </div>
            <Table data={alumnos} columns={['matricula', 'nombre', 'apellido', 'direccion']} />
          </>
        )}

        {vista === 'maestros' && (
          <>
            <PageHeader title="Plantilla Docente" subtitle="Administración de profesores y datos de contacto." />
            <div className="card">
              <h3 style={{marginTop:0, marginBottom: '20px'}}>Registrar Docente</h3>
              <form onSubmit={(e) => enviarFormulario(e, 'maestros', nuevoMaestro, setNuevoMaestro, initialMaestro, setMaestros)}>
                <div className="form-grid">
                  <Input label="Nombre" name="nombre" value={nuevoMaestro.nombre} onChange={(e) => handleChange(e, setNuevoMaestro, nuevoMaestro)} required />
                  <Input label="Apellido" name="apellido" value={nuevoMaestro.apellido} onChange={(e) => handleChange(e, setNuevoMaestro, nuevoMaestro)} required />
                  <Input label="Email Institucional" type="email" name="email" value={nuevoMaestro.email} onChange={(e) => handleChange(e, setNuevoMaestro, nuevoMaestro)} />
                  <Input label="Teléfono" name="telefono" value={nuevoMaestro.telefono} onChange={(e) => handleChange(e, setNuevoMaestro, nuevoMaestro)} />
                </div>
                <button type="submit" className="btn-primary">Guardar Docente</button>
              </form>
            </div>
            <Table data={maestros} columns={['nombre', 'apellido', 'email', 'telefono']} />
          </>
        )}

        {vista === 'materias' && (
          <>
            <PageHeader title="Catálogo de Materias" subtitle="Configuración de asignaturas disponibles." />
            <div className="card">
              <form onSubmit={(e) => enviarFormulario(e, 'materias', nuevaMateria, setNuevaMateria, initialMateria, setMaterias)} style={{display: 'flex', alignItems: 'flex-end', gap: '15px'}}>
                <Input label="Clave" name="claveMateria" value={nuevaMateria.clave_materia} onChange={(e) => handleChange(e, setNuevaMateria, nuevaMateria)} required />
                <Input label="Nombre de la Materia" name="nombreMateria" value={nuevaMateria.nombre_materia} onChange={(e) => handleChange(e, setNuevaMateria, nuevaMateria)} required style={{flex: 2}} />
                <button type="submit" className="btn-primary" style={{marginBottom: '2px'}}>Agregar</button>
              </form>
            </div>
            <Table data={materias} columns={['claveMateria', 'nombreMateria']} />
          </>
        )}

        {vista === 'turnos' && (
          <>
            <PageHeader title="Gestión de Turnos" subtitle="Horarios disponibles para asignación." />
            <div className="card" style={{maxWidth: '500px'}}>
              <form onSubmit={(e) => enviarFormulario(e, 'turnos', nuevoTurno, setNuevoTurno, initialTurno, setTurnos)} style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
                <Input label="Nombre del Turno" name="nombreTurno" value={nuevoTurno.nombre_turno} onChange={(e) => handleChange(e, setNuevoTurno, nuevoTurno)} required style={{flex: 1}}/>
                <button type="submit" className="btn-primary">Crear</button>
              </form>
            </div>
            <Table data={turnos} columns={['nombreTurno']} />
          </>
        )}

        {vista === 'asignaciones' && (
          <>
            <PageHeader title="Carga Académica" subtitle="Vinculación de docentes, materias y horarios." />
            
            <div className="card" style={{borderLeft: '4px solid var(--accent)'}}>
              <h3 style={{marginTop:0}}>Nueva Asignación</h3>
              <form onSubmit={(e) => enviarFormulario(e, 'asignaciones', nuevaAsignacion, setNuevaAsignacion, initialAsignacion, setAsignaciones)}>
                <div className="form-grid">
                  <Select label="Docente" name="maestro_id" value={nuevaAsignacion.maestro_id} onChange={(e) => handleChange(e, setNuevaAsignacion, nuevaAsignacion)} options={maestros} labelKey={m => `${m.nombre} ${m.apellido}`} />
                  <Select label="Materia" name="materia_id" value={nuevaAsignacion.materia_id} onChange={(e) => handleChange(e, setNuevaAsignacion, nuevaAsignacion)} options={materias} labelKey="nombreMateria" />
                  <Select label="Turno" name="turno_id" value={nuevaAsignacion.turno_id} onChange={(e) => handleChange(e, setNuevaAsignacion, nuevaAsignacion)} options={turnos} labelKey="nombreTurno" />
                </div>
                <button type="submit" className="btn-primary">Asignar Carga</button>
              </form>
            </div>

            <div className="card table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Docente</th><th>Materia Asignada</th><th>Turno</th>
                  </tr>
                </thead>
                <tbody>
                  {asignaciones.map(a => (
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td style={{fontWeight: 500}}>{a.maestro ? `${a.maestro.nombre} ${a.maestro.apellido}` : '---'}</td>
                      <td>
                        <span style={{background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em'}}>
                          {a.materia ? a.materia.nombre_materia : '---'}
                        </span>
                      </td>
                      <td>{a.turno ? a.turno.nombre_turno : '---'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES PARA LIMPIEZA VISUAL ---

const NavButton = ({ active, onClick, icon, label }) => (
  <button className={`nav-btn ${active ? 'active' : ''}`} onClick={onClick}>
    {icon}
    <span>{label}</span>
  </button>
);

const Input = ({ label, ...props }) => (
  <div className="input-group" style={props.style}>
    <label>{label}</label>
    <input {...props} />
  </div>
);

const Select = ({ label, options, labelKey, ...props }) => (
  <div className="input-group">
    <label>{label}</label>
    <select {...props}>
      <option value="">-- Seleccionar --</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {typeof labelKey === 'function' ? labelKey(opt) : opt[labelKey]}
        </option>
      ))}
    </select>
  </div>
);

export default App;