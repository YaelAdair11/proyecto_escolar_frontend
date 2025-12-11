import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, GraduationCap, Clock, BookOpen, School, LogOut, Lock, ArrowLeft, Save, Megaphone, Library, ClipboardCheck } from 'lucide-react'; 
import './App.css';

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
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
            <Lock size={16} style={{ marginRight: '8px' }}/> Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---
function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('alumnos');
  const [teacherVista, setTeacherVista] = useState('misCursos'); // Opciones: 'misCursos', 'verAlumnos', 'gestorAnuncios', 'bibliotecaRecursos', 'controlAsistencia'
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [alumnosCurso, setAlumnosCurso] = useState([]);

  // Estados para Gestor de Anuncios
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', targetCourseId: 'all' }); // 'all' o un ID de curso

  // Estados para Biblioteca de Recursos
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: '', url: '', file: null, courseId: '' });

  // Estados para Control de Asistencia
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedAttendanceCourseId, setSelectedAttendanceCourseId] = useState('');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState('');
  const [studentsForAttendance, setStudentsForAttendance] = useState([]); // Estudiantes para el curso/fecha seleccionados
  
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
  const initialMaestro = { nombre: '', apellido: '', email: '', telefono: '', password: '' };
  const initialAsignacion = { maestro_id: '', materia_id: '', turno_id: '' };

  const [nuevoAlumno, setNuevoAlumno] = useState(initialAlumno);
  const [nuevaMateria, setNuevaMateria] = useState(initialMateria);
  const [nuevoTurno, setNuevoTurno] = useState(initialTurno);
  const [nuevoMaestro, setNuevoMaestro] = useState(initialMaestro);
  const [nuevaAsignacion, setNuevaAsignacion] = useState(initialAsignacion);

  // --- CARGA INICIAL ---
  useEffect(() => {
    if (usuario) {
      cargarData('materias', setMaterias);
      cargarData('turnos', setTurnos);
      cargarData('maestros', setMaestros);
      cargarData('asignaciones', setAsignaciones); 

      if(usuario.rol === 'docente') {
        setVista('dashboardDocente');
      } else {
        setVista('alumnos');
      }
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;
    if (vista === 'alumnos') cargarData('alumnos', setAlumnos);
  }, [vista, usuario]);

  const cargarData = (entidad, setter) => {
    fetch(`http://localhost:8080/api/${entidad}`)
      .then(res => res.json())
      .then(data => setter(data))
      .catch(err => console.error(err));
  };
  
  // --- FUNCIONALIDAD DOCENTE ---
  const handleVerAlumnos = (asignacion) => {
    setSelectedAsignacion(asignacion);
    // Este endpoint ahora debe devolver los alumnos CON su calificación.

    fetch(`http://localhost:8080/api/asignaciones/${asignacion.id}/alumnos`)
      .then(res => res.json())
      .then(data => {
        // Asegurarnos que la calificación no sea null para el input
        const alumnosConCalificacion = data.map(a => ({ ...a, calificacion: a.calificacion ?? '' }));
        setAlumnosCurso(alumnosConCalificacion);
        setTeacherVista('verAlumnos');
      })
      .catch(err => console.error("Error al cargar alumnos del curso:", err));
  };

  const handleCalificacionChange = (alumnoId, nuevaCalificacion) => {
    const nuevosAlumnos = alumnosCurso.map(alumno => 
      alumno.id === alumnoId ? { ...alumno, calificacion: nuevaCalificacion } : alumno
    );
    setAlumnosCurso(nuevosAlumnos);
  };

  const handleGuardarCalificacion = (alumnoId, asignacionId, calificacion) => {
    fetch('http://localhost:8080/api/calificaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumnoId, asignacionId, calificacion: parseFloat(calificacion) })
    })
    .then(res => {
      if(!res.ok) throw new Error("Error al guardar calificación");
      alert(`Calificación para el alumno ${alumnoId} guardada exitosamente.`);
    })
    .catch(err => alert(err.message));
  };


  const handleChange = (e, setter, estado) => {
    setter({ ...estado, [e.target.name]: e.target.value });
  };

  const enviarFormulario = (e, entidad, data, setterClean, estadoClean, refreshSetter) => {
    e.preventDefault();
    fetch(`http://localhost:8080/api/${entidad}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(() => {
      alert('Registro guardado correctamente'); 
      setterClean(estadoClean);
      cargarData(entidad, refreshSetter);
    });
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setVista('alumnos');
    setTeacherVista('misCursos'); // Resetear vista de docente
  };

  // --- COMPONENTES UI REUTILIZABLES ---
  
  const PageHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '30px' }}>
      <h1 className="header-title">{title}</h1>
      <p className="header-subtitle">{subtitle}</p>
    </div>
  );
  
  // VISTA DE ALUMNOS POR CURSO 
  const AlumnosCursoVista = ({ asignacion, alumnos }) => (
    <>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
        <button onClick={() => setTeacherVista('misCursos')} className="btn-secondary" style={{padding: '10px'}}>
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={`Calificaciones de ${asignacion.materia.nombreMateria}`}
          subtitle={`Gestiona las notas de los estudiantes para el turno ${asignacion.turno.nombreTurno}.`} 
        />
      </div>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th style={{width: '120px'}}>Calificación</th>
              <th style={{width: '120px'}}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.length > 0 ? alumnos.map(alumno => (
              <tr key={alumno.id}>
                <td>{alumno.matricula}</td>
                <td>{alumno.nombre}</td>
                <td>{alumno.apellido}</td>
                <td>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10" 
                    value={alumno.calificacion} 
                    onChange={(e) => handleCalificacionChange(alumno.id, e.target.value)}
                    style={{ margin: 0, padding: '8px' }}
                  />
                </td>
                <td>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleGuardarCalificacion(alumno.id, asignacion.id, alumno.calificacion)}
                    style={{padding: '8px 12px'}}
                  >
                    <Save size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                  No hay alumnos inscritos en este curso.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const TeacherDashboard = ({ usuario, asignaciones }) => {
    const misAsignaciones = asignaciones.filter(a => a.maestro && a.maestro.id == usuario.id);
    
    return (
      <>
        {teacherVista === 'misCursos' && (
          <>
            <PageHeader title="Mis Cursos Asignados" subtitle={`Hola ${usuario.nombre}, aquí puedes gestionar tus cursos.`} />
            
            {misAsignaciones.length > 0 ? (
              <div className="course-grid">
                {misAsignaciones.map(asignacion => (
                  <div key={asignacion.id} className="card course-card">
                    <div className="course-card-header">
                      <BookOpen size={20} />
                      <h3>{asignacion.materia ? asignacion.materia.nombreMateria : 'Materia no definida'}</h3>
                    </div>
                    <div className="course-card-body">
                      <p><strong>Turno:</strong> {asignacion.turno ? asignacion.turno.nombreTurno : 'No definido'}</p>
                      <p><strong>Clave:</strong> {asignacion.materia ? asignacion.materia.claveMateria : 'N/A'}</p>
                    </div>
                    <div className="course-card-footer">
                      <button className="btn-primary" onClick={() => handleVerAlumnos(asignacion)}>
                        <Users size={16} style={{marginRight: '8px'}}/>
                        Gestionar Curso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{textAlign: 'center', padding: '40px'}}>
                <p>No tienes cursos asignados en este momento.</p>
              </div>
            )}
          </>
        )}
        
        {teacherVista === 'verAlumnos' && selectedAsignacion && (
          <AlumnosCursoVista asignacion={selectedAsignacion} alumnos={alumnosCurso} />
        )}

        {teacherVista === 'gestorAnuncios' && (
          <PageHeader title="Gestor de Anuncios" subtitle="Crea, edita y envía anuncios a tus cursos." />
        )}
        {teacherVista === 'bibliotecaRecursos' && (
          <PageHeader title="Biblioteca de Recursos" subtitle="Sube y organiza material de estudio para tus materias." />
        )}
        {teacherVista === 'controlAsistencia' && (
          <PageHeader title="Control de Asistencia" subtitle="Pasa lista de forma digital y consulta reportes." />
        )}
      </>
    );
  };


  // --- RENDERIZADO PRINCIPAL ---

  if (!usuario) {
    return <Login onLogin={(datosUsuario) => setUsuario(datosUsuario)} />;
  }

  return (
    <div className="dashboard-layout">
      
      {/* SIDEBAR DE NAVEGACIÓN */}
      <aside className="sidebar">
        <div className="brand">
          <School size={28} />
          <span>EduPortal</span>
        </div>

        <div style={{ padding: '0 20px', marginBottom: '20px', fontSize: '0.8em', color: '#94a3b8' }}>
            Hola, {usuario.nombre} <br/>
            <span style={{color: 'var(--accent)', textTransform: 'uppercase'}}>{usuario.rol}</span>
        </div>

        <nav className="nav-menu">
          {usuario.rol === 'admin' ? (
            <>
              <NavButton active={vista === 'asignaciones'} onClick={() => setVista('asignaciones')} icon={<LayoutDashboard size={20}/>} label="Carga Académica" />
              <NavButton active={vista === 'alumnos'} onClick={() => setVista('alumnos')} icon={<Users size={20}/>} label="Alumnos" />
              <NavButton active={vista === 'maestros'} onClick={() => setVista('maestros')} icon={<GraduationCap size={20}/>} label="Docentes" />
              <NavButton active={vista === 'materias'} onClick={() => setVista('materias')} icon={<BookOpen size={20}/>} label="Materias" />
              <NavButton active={vista === 'turnos'} onClick={() => setVista('turnos')} icon={<Clock size={20}/>} label="Turnos" />
            </>
          ) : (
            <>
              <NavButton active={teacherVista === 'misCursos'} onClick={() => setTeacherVista('misCursos')} icon={<LayoutDashboard size={20}/>} label="Mis Cursos" />
              <NavButton active={teacherVista === 'gestorAnuncios'} onClick={() => setTeacherVista('gestorAnuncios')} icon={<Megaphone size={20}/>} label="Gestor de Anuncios" />
              <NavButton active={teacherVista === 'bibliotecaRecursos'} onClick={() => setTeacherVista('bibliotecaRecursos')} icon={<Library size={20}/>} label="Biblioteca de Recursos" />
              <NavButton active={teacherVista === 'controlAsistencia'} onClick={() => setTeacherVista('controlAsistencia')} icon={<ClipboardCheck size={20}/>} label="Control de Asistencia" />
            </>
          )}
          
          <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0'}}></div>
          <button className="nav-btn" onClick={cerrarSesion} style={{color: '#f87171'}}>
            <LogOut size={20}/> <span>Cerrar Sesión</span>
          </button>
        </nav>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="main-content">
        
        {vista === 'dashboardDocente' && usuario.rol === 'docente' && (
          <TeacherDashboard usuario={usuario} asignaciones={asignaciones} />
        )}
        
        {vista === 'alumnos' && usuario.rol === 'admin' && (
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
            {/* El componente Table genérico ya no se usa para admin en esta vista */}
          </>
        )}

        {vista === 'maestros' && usuario.rol === 'admin' && (
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
                  <Input label="Contraseña" name="password" type="password" value={nuevoMaestro.password} onChange={(e) => handleChange(e, setNuevoMaestro, nuevoMaestro)} required placeholder="Para su login" />
                </div>
                <button type="submit" className="btn-primary">Guardar Docente</button>
              </form>
            </div>
            {/* El componente Table genérico ya no se usa para admin en esta vista */}
          </>
        )}

        {vista === 'materias' && usuario.rol === 'admin' && (
          <>
            <PageHeader title="Catálogo de Materias" subtitle="Configuración de asignaturas disponibles." />
            <div className="card">
              <form onSubmit={(e) => enviarFormulario(e, 'materias', nuevaMateria, setNuevaMateria, initialMateria, setMaterias)} style={{display: 'flex', alignItems: 'flex-end', gap: '15px'}}>
                <Input label="Clave" name="claveMateria" value={nuevaMateria.clave_materia} onChange={(e) => handleChange(e, setNuevaMateria, nuevaMateria)} required />
                <Input label="Nombre de la Materia" name="nombreMateria" value={nuevaMateria.nombre_materia} onChange={(e) => handleChange(e, setNuevaMateria, nuevaMateria)} required style={{flex: 2}} />
                <button type="submit" className="btn-primary" style={{marginBottom: '2px'}}>Agregar</button>
              </form>
            </div>
             {/* El componente Table genérico ya no se usa para admin en esta vista */}
          </>
        )}

        {vista === 'turnos' && usuario.rol === 'admin' && (
          <>
            <PageHeader title="Gestión de Turnos" subtitle="Horarios disponibles para asignación." />
            <div className="card" style={{maxWidth: '500px'}}>
              <form onSubmit={(e) => enviarFormulario(e, 'turnos', nuevoTurno, setNuevoTurno, initialTurno, setTurnos)} style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
                <Input label="Nombre del Turno" name="nombreTurno" value={nuevoTurno.nombre_turno} onChange={(e) => handleChange(e, setNuevoTurno, nuevoTurno)} required style={{flex: 1}}/>
                <button type="submit" className="btn-primary">Crear</button>
              </form>
            </div>
             {/* El componente Table genérico ya no se usa para admin en esta vista */}
          </>
        )}

        {vista === 'asignaciones' && usuario.rol === 'admin' && (
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
    {label && <label>{label}</label>}
    <input {...props} className="input-field"/>
  </div>
);

const Select = ({ label, options, labelKey, ...props }) => (
  <div className="input-group">
    <label>{label}</label>
    <select {...props} className="input-field">
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