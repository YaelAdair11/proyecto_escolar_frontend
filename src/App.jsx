import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, GraduationCap, Clock, BookOpen, School, LogOut, Lock, ArrowLeft, Save, Megaphone, Library, ClipboardCheck, Trash2, UserPlus } from 'lucide-react'; 
import './App.css';

// Componente para el Inicio de Sesión
const Login = ({ onLogin }) => {
  // Guardamos el email y contraseña que el usuario escribe
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Esta función envía los datos al servidor para ver si el usuario existe
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
      // Si todo sale bien, avisamos a la App principal que ya entramos
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

// --- MODAL PARA INSCRIBIR ALUMNOS (ADMIN) ---
// Ventana emergente para seleccionar qué alumnos van a qué clase
const InscripcionModal = ({ asignacion, onClose, allAlumnos }) => {
  const [inscritos, setInscritos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la ventana, cargamos quiénes ya están inscritos para marcarlos
  useEffect(() => {
    fetch(`http://localhost:8080/api/inscripciones/${asignacion.id}`)
      .then(res => res.json())
      .then(ids => {
        setInscritos(ids);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [asignacion]);

  // Función para marcar o desmarcar un alumno de la lista
  const toggleAlumno = (id) => {
    if (inscritos.includes(id)) {
      setInscritos(inscritos.filter(i => i !== id)); // Quitar
    } else {
      setInscritos([...inscritos, id]); // Poner
    }
  };

  // Guardamos la lista final de inscritos en la base de datos
  const handleGuardar = () => {
    fetch('http://localhost:8080/api/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asignacionId: asignacion.id,
        alumnoIds: inscritos
      })
    })
    .then(res => {
      if(res.ok) {
        alert("¡Inscripción actualizada correctamente!");
        onClose();
      } else {
        alert("Error al guardar inscripciones.");
      }
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="card" style={{width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
        <h3>Inscribir Alumnos - {asignacion.materia.nombreMateria}</h3>
        <p style={{color: '#64748b', fontSize: '0.9em', marginBottom: '15px'}}>
          Selecciona los estudiantes para el turno {asignacion.turno.nombreTurno}.
        </p>

        {isLoading ? <p>Cargando lista...</p> : (
          <div style={{overflowY: 'auto', flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px'}}>
            {allAlumnos.map(alumno => (
              <div key={alumno.id} style={{
                display: 'flex', alignItems: 'center', padding: '8px', 
                borderBottom: '1px solid #f1f5f9', gap: '10px'
              }}>
                <input 
                  type="checkbox" 
                  checked={inscritos.includes(alumno.id)} 
                  onChange={() => toggleAlumno(alumno.id)}
                  style={{width: '18px', height: '18px', cursor: 'pointer'}}
                />
                <div>
                  <div style={{fontWeight: '500'}}>{alumno.nombre} {alumno.apellido}</div>
                  <div style={{fontSize: '0.8em', color: '#94a3b8'}}>{alumno.matricula}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleGuardar}>Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---
function App() {
  // Aquí guardamos quién está conectado y qué pantalla está viendo
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('alumnos');
  
  // Estados para cuando entra un profesor
  const [teacherVista, setTeacherVista] = useState('misCursos'); 
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [alumnosCurso, setAlumnosCurso] = useState([]);

  // Estado para el Modal de Inscripción (ADMIN)
  const [asignacionParaInscribir, setAsignacionParaInscribir] = useState(null);

  // --- ESTADOS DE DATOS (Admin) ---
  // Aquí almacenamos las listas que vienen de la base de datos
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  // --- FORMULARIOS ---
  // Estructuras iniciales para limpiar los formularios después de guardar
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
  // Cuando el usuario entra, cargamos los datos necesarios según su rol
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

  // Recarga datos específicos si cambiamos de pestaña en el menú de Admin
  useEffect(() => {
    if (!usuario) return;
    // Carga de datos según la vista del Admin
    if (vista === 'alumnos') cargarData('alumnos', setAlumnos);
    if (vista === 'maestros') cargarData('maestros', setMaestros);
    if (vista === 'materias') cargarData('materias', setMaterias);
    if (vista === 'turnos') cargarData('turnos', setTurnos);
    if (vista === 'asignaciones') {
      cargarData('asignaciones', setAsignaciones);
      cargarData('alumnos', setAlumnos); // Necesitamos alumnos para el modal de inscripción
    }
  }, [vista, usuario]);

  // Función genérica para pedir datos a la API (ahorra repetir código)
  const cargarData = (entidad, setter) => {
    fetch(`http://localhost:8080/api/${entidad}`)
      .then(res => res.json())
      .then(data => setter(data))
      .catch(err => console.error(err));
  };
  
  // --- FUNCIONALIDAD DOCENTE ---
  // Carga los alumnos de una materia específica para poder calificar
  const handleVerAlumnos = (asignacion) => {
    setSelectedAsignacion(asignacion);
    fetch(`http://localhost:8080/api/asignaciones/${asignacion.id}/alumnos`)
      .then(res => res.json())
      .then(data => {
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

  // Envía la calificación de un alumno al servidor
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


  // Función para manejar lo que escribimos en los inputs
  const handleChange = (e, setter, estado) => {
    setter({ ...estado, [e.target.name]: e.target.value });
  };

  // Función genérica para enviar cualquier formulario de registro
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
    setTeacherVista('misCursos');
  };

  // --- COMPONENTES UI REUTILIZABLES ---
  
  const PageHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '30px' }}>
      <h1 className="header-title">{title}</h1>
      <p className="header-subtitle">{subtitle}</p>
    </div>
  );

// VISTA DE CALIFICACIONES (DOCENTE) 
  const AlumnosCursoVista = ({ asignacion, alumnos }) => { 
    const [listaAlumnos, setListaAlumnos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar alumnos y sus calificaciones al abrir esta vista
    useEffect(() => {
      setIsLoading(true);
      fetch(`http://localhost:8080/api/asignaciones/${asignacion.id}/alumnos-con-calificacion`)
        .then(res => res.json())
        .then(data => {
          setListaAlumnos(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false); 
        });
    }, [asignacion]);

    // Validamos que la nota sea un número lógico (0 a 10)
    const handleCalificacionChange = (alumnoId, nuevoValor) => {
      let valor = parseFloat(nuevoValor);
      if (valor > 10) valor = 10;
      if (valor < 0) valor = 0;
      const valorFinal = nuevoValor === '' ? '' : valor;

      setListaAlumnos(listaAlumnos.map(alumno => 
        alumno.id === alumnoId ? { ...alumno, calificacion: valorFinal } : alumno
      ));
    };

    const handleGuardarCalificacion = (alumnoId, calificacion) => {
      if (calificacion === '' || calificacion === null || isNaN(calificacion)) {
        alert("Por favor ingresa una calificación numérica válida.");
        return;
      }
      fetch('http://localhost:8080/api/calificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumnoId, asignacionId: asignacion.id, calificacion: parseFloat(calificacion) })
      })
      .then(res => { if(!res.ok) throw new Error("Error"); return res.json(); })
      .then(() => alert(`Calificación guardada correctamente.`))
      .catch(err => alert("Error al guardar: " + err.message));
    };

    return (
      <>
        {/* --- ESTILOS CSS EXCLUSIVOS PARA IMPRESIÓN --- */}
        {/* Esto hace que al imprimir la página, oculte menús y se vea como un acta oficial */}
        <style>{`
          @media print {
            @page { margin: 20mm; size: letter; } /* Márgenes profesionales */
            
            body { 
              background: white; 
              font-family: 'Garamond', 'Times New Roman', serif; /* Tipografía Académica */
              color: #111;
            }

            /* Ocultar interfaz de la app */
            .no-print, .sidebar, .btn-primary, .input-group label, button, ::-webkit-scrollbar { 
              display: none !important; 
            }
            
            /* Ajustar layout */
            .dashboard-layout, .main-content { display: block !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
            .card { box-shadow: none !important; border: none !important; padding: 0 !important; }

            /* Encabezado Oficial */
            .print-header { 
              display: flex !important; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 15px; 
              margin-bottom: 30px; 
            }
            .print-logo { font-size: 24px; font-weight: bold; text-transform: uppercase; display: flex; align-items: center; gap: 10px; }
            .print-meta { text-align: right; font-size: 12px; color: #555; }

            /* Grid de Información del Curso */
            .course-info-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background-color: #f9f9f9 !important; /* Gris muy suave */
              -webkit-print-color-adjust: exact;
            }
            .info-item label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 4px; }
            .info-item span { display: block; font-size: 14px; font-weight: bold; }

            /* Tabla */
            table { width: 100%; border-collapse: collapse; font-size: 12pt; }
            thead th { 
              background-color: #333 !important; 
              color: white !important; 
              padding: 12px; 
              text-transform: uppercase; 
              font-size: 10pt; 
              letter-spacing: 1px;
              -webkit-print-color-adjust: exact;
            }
            tbody tr { border-bottom: 1px solid #eee; }
            tbody td { padding: 12px 8px; }
            /* Filas cebra sutiles */
            tbody tr:nth-child(even) { background-color: #fcfcfc !important; -webkit-print-color-adjust: exact; }

            /* Inputs limpios */
            input { 
              border: none !important; 
              background: transparent !important; 
              font-weight: bold; 
              color: black !important; 
              text-align: center;
              font-family: inherit;
              font-size: inherit;
            }

            /* Sección de Firma */
            .signature-section {
              display: block !important;
              margin-top: 60px;
              page-break-inside: avoid;
            }
            .signature-line {
              width: 250px;
              border-top: 1px solid #000;
              margin: 0 auto;
              text-align: center;
              padding-top: 10px;
              font-size: 12px;
              text-transform: uppercase;
            }
          }
          /* Ocultar elementos de impresión en la pantalla normal */
          .print-header, .course-info-grid, .signature-section { display: none; }
        `}</style>

        {/* --- ESTRUCTURA VISIBLE SOLO AL IMPRIMIR --- */}
        
        {/* 1. Encabezado Institucional */}
        <div className="print-header">
            <div className="print-logo">
               <School size={32} /> 
               <span>EduPortal Institucional</span>
            </div>
            <div className="print-meta">
               <p>Fecha de emisión: {new Date().toLocaleDateString()}</p>
               <p>Folio: {Math.floor(Math.random() * 10000)}</p>
            </div>
        </div>

        {/* 2. Caja de Información del Curso */}
        <div className="course-info-grid">
            <div className="info-item">
               <label>Materia</label>
               <span>{asignacion.materia.nombreMateria}</span>
            </div>
            <div className="info-item">
               <label>Docente</label>
               <span>{usuario.nombre} {usuario.apellido}</span>
            </div>
            <div className="info-item">
               <label>Clave</label>
               <span>{asignacion.materia.claveMateria}</span>
            </div>
            <div className="info-item">
               <label>Turno</label>
               <span>{asignacion.turno.nombreTurno}</span>
            </div>
        </div>

        {/* --- INTERFAZ NORMAL DE PANTALLA --- */}
        <div className="no-print" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button onClick={() => setTeacherVista('misCursos')} className="btn-secondary" style={{padding: '10px'}}>
            <ArrowLeft size={20} />
          </button>
          <PageHeader 
            title={`Calificaciones: ${asignacion.materia.nombreMateria}`}
            subtitle="Gestiona y reporta las evaluaciones del grupo." 
          />
        </div>

        <div className="card table-container" style={{border: 'none', boxShadow: 'none'}}> {/* Quitar bordes al imprimir */}
          
          <div className="no-print" style={{textAlign: 'right', marginBottom: '15px'}}>
             <button onClick={() => window.print()} className="btn-secondary" style={{display:'inline-flex', alignItems:'center', gap:'8px'}}>
                <Save size={16} /> Imprimir Acta Oficial
             </button>
          </div>

          {isLoading ? <p>Cargando datos...</p> : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Matrícula</th>
                    <th>Estudiante</th>
                    <th style={{width: '150px', textAlign:'center'}}>Calificación Final</th>
                    <th className="no-print" style={{width: '100px'}}>Guardar</th>
                  </tr>
                </thead>
                <tbody>
                  {listaAlumnos.length > 0 ? listaAlumnos.map(alumno => (
                    <tr key={alumno.id}>
                      <td style={{fontFamily: 'monospace', fontSize:'1.1em'}}>{alumno.matricula}</td>
                      <td style={{fontWeight: 'bold'}}>{alumno.apellido}, {alumno.nombre}</td>
                      <td>
                        <Input 
                          type="number" min="0" max="10" step="0.1"
                          value={alumno.calificacion !== null ? alumno.calificacion : ''} 
                          onChange={(e) => handleCalificacionChange(alumno.id, e.target.value)}
                          style={{ margin: 0, padding: '8px', textAlign: 'center', fontWeight: 'bold' }}
                          placeholder="-"
                        />
                      </td>
                      <td className="no-print">
                        <button 
                          className="btn-primary" 
                          onClick={() => handleGuardarCalificacion(alumno.id, alumno.calificacion)}
                          style={{padding: '8px 12px'}}
                        >
                          <Save size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                        No hay alumnos inscritos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* 3. Firma del Docente (Solo visible al imprimir) */}
              <div className="signature-section">
                 <div className="signature-line">
                    <p>{usuario.nombre} {usuario.apellido}</p>
                    <p style={{fontWeight: 'normal', fontSize: '10px', color: '#666'}}>Firma del Docente</p>
                 </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  };


  // VISTA DE RECURSOS (DOCENTE) 
  // Aquí el profe puede subir archivos PDF o Links para su clase
  const RecursosVista = ({ misAsignaciones }) => {
    const [selectedCourse, setSelectedCourse] = useState(misAsignaciones[0]?.id || '');
    const [recursos, setRecursos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'link', link: '', file: null, base64: '' });

    // Cuando cambia el curso seleccionado, cargamos sus materiales
    useEffect(() => {
      if (!selectedCourse) { setRecursos([]); return; };
      cargarRecursos();
    }, [selectedCourse]);

    const cargarRecursos = () => {
      setIsLoading(true);
      fetch(`http://localhost:8080/api/asignaciones/${selectedCourse}/recursos`)
        .then(res => res.json())
        .then(data => setRecursos(data))
        .catch(err => {
          console.error("Error:", err);
          alert("Error de conexión: No se pudo cargar la biblioteca.");
        })
        .finally(() => setIsLoading(false));
    };

    // Si seleccionan un archivo, lo leemos y convertimos para enviarlo
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('El archivo es demasiado grande (Máximo 2MB).');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm({ ...form, file: file, base64: reader.result });
          alert('Archivo cargado correctamente. No olvides dar clic en Guardar.');
        };
        reader.readAsDataURL(file);
      }
    };

    const isValidUrl = (urlString) => {
        try { return Boolean(new URL(urlString)); } catch(e){ return false; }
    }

    // Validamos y guardamos el recurso nuevo en el servidor
    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!form.title.trim()) { alert('El campo "Título" es obligatorio.'); return; }
      
      if (form.type === 'link') {
        if (!form.link) { alert('Debes escribir una URL.'); return; }
        if (!isValidUrl(form.link)) { alert('La URL no es válida. Asegúrate de incluir http:// o https://'); return; }
      } else if (form.type === 'file' && !form.base64) {
        alert('Por favor selecciona un archivo PDF o imagen.'); return;
      }

      const payload = {
        titulo: form.title, type: form.type,
        url: form.type === 'link' ? form.link : '',
        archivoBase64: form.type === 'file' ? form.base64 : '',
        asignacionId: selectedCourse
      };

      fetch('http://localhost:8080/api/recursos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error del servidor');
        return data;
      })
      .then(nuevoRecurso => {
        setRecursos([...recursos, nuevoRecurso]);
        setForm({ title: '', type: 'link', link: '', file: null, base64: '' });
        alert('¡Recurso guardado exitosamente!');
      })
      .catch(err => alert("Error: " + err.message));
    };

    // Borrar un recurso de la lista
    const handleDelete = (id) => {
      if(!window.confirm("¿Confirma que desea eliminar este recurso permanentemente?")) return;
      fetch(`http://localhost:8080/api/recursos/${id}`, { method: 'DELETE' })
      .then(res => {
        if(res.ok) {
          setRecursos(recursos.filter(r => r.id !== id));
          alert('El recurso ha sido eliminado.');
        } else {
          alert('No se pudo eliminar el recurso.');
        }
      });
    };

    return (
      <>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button onClick={() => setTeacherVista('misCursos')} className="btn-secondary" style={{padding: '10px'}}>
            <ArrowLeft size={20} />
          </button>
          <PageHeader title="Biblioteca de Recursos" subtitle="Gestiona enlaces y documentos para tus alumnos." />
        </div>
        <div className="card" style={{borderLeft: '4px solid var(--accent)'}}>
          <h3 style={{marginTop:0}}>Agregar Nuevo Recurso</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <Select label="Curso Destino" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} options={misAsignaciones} labelKey={a => a.materia.nombreMateria} style={{gridColumn: 'span 2'}} />
              <Input label="Título del Material" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ej: Guía de estudio..." required />
              <div className="input-group">
                <label>Formato</label>
                <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="link">Enlace Web (URL)</option>
                  <option value="file">Documento (PDF/Imagen)</option>
                </select>
              </div>
              {form.type === 'link' ? (
                <Input label="Dirección Web (URL)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://..." style={{gridColumn: 'span 2'}} />
              ) : (
                <div className="input-group" style={{gridColumn: 'span 2'}}>
                  <label>Seleccionar Archivo (Max 2MB)</label>
                  <input type="file" className="input-field" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFileChange} />
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{marginTop: '15px'}}><Save size={16} style={{marginRight:5}}/> Guardar en Biblioteca</button>
          </form>
        </div>
        <div className="card table-container" style={{marginTop: '30px'}}>
           <h3 style={{marginTop:0, marginBottom: '20px'}}>Material Disponible</h3>
          {isLoading ? <p style={{color:'#64748b'}}>Cargando biblioteca...</p> : (
            <table>
              <thead><tr><th>Recurso</th><th>Formato</th><th>Fecha</th><th style={{textAlign:'right'}}>Acciones</th></tr></thead>
              <tbody>
                {recursos.length > 0 ? recursos.map(res => (
                  <tr key={res.id}>
                    <td><div style={{display:'flex', alignItems:'center', gap:'10px', fontWeight:'500'}}>{res.tipo === 'link' ? <BookOpen size={18} color="#2563eb"/> : <Library size={18} color="#ea580c"/>}{res.titulo}</div></td>
                    <td><span className="badge" style={{background: res.tipo === 'link' ? '#e0f2fe' : '#ffedd5', color: res.tipo === 'link' ? '#0369a1' : '#c2410c'}}>{res.tipo === 'link' ? 'ENLACE' : 'ARCHIVO'}</span></td>
                    <td>{new Date(res.createdAt).toLocaleDateString()}</td>
                    <td style={{textAlign:'right'}}>
                      <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                        {res.tipo === 'link' ? (
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{padding:'6px 10px', textDecoration:'none', fontSize:'0.85em'}} onClick={(e) => { if (!res.url || !res.url.startsWith('http')) { e.preventDefault(); alert("La URL guardada parece defectuosa. Sugerimos eliminar este recurso."); }}}>Abrir</a>
                        ) : (
                          <a href={res.archivoBase64} download={`${res.titulo}.pdf`} className="btn-secondary" style={{padding:'6px 10px', textDecoration:'none', fontSize:'0.85em'}}>Descargar</a>
                        )}
                        <button onClick={() => handleDelete(res.id)} style={{background: '#fee2e2', color: '#ef4444', border:'none', borderRadius:'6px', padding:'6px', cursor:'pointer'}}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Esta materia no tiene recursos asignados todavía.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  };
  
  // VISTA DE ASISTENCIA (DOCENTE)
  // Controla tanto el pase de lista diario como el reporte general tipo Excel
  const AsistenciaVista = ({ misAsignaciones }) => {
    const [modo, setModo] = useState('diario'); // 'diario' o 'reporte'
    const [selectedCourse, setSelectedCourse] = useState(misAsignaciones[0]?.id || '');
    
    // Estados para MODO DIARIO
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [listaAlumnos, setListaAlumnos] = useState([]);
    const [listaCargada, setListaCargada] = useState(false);
    
    // Estados para MODO REPORTE
    // Por defecto: últimos 7 días. El usuario puede cambiarlo.
    const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
    const [datosReporte, setDatosReporte] = useState([]);
    const [diasReporte, setDiasReporte] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const cursoActual = misAsignaciones.find(c => c.id == selectedCourse);

    // --- LÓGICA MODO DIARIO ---
    const handleCargarLista = () => {
      if (!selectedCourse) return;
      setIsLoading(true);
      fetch(`http://localhost:8080/api/asignaciones/${selectedCourse}/asistencia?fecha=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setListaAlumnos(data);
          setListaCargada(true);
        })
        .finally(() => setIsLoading(false));
    };

    // Guardamos la asistencia del día actual
    const handleGuardarAsistencia = () => {
      const payload = {
        asignacionId: selectedCourse,
        fecha: selectedDate,
        asistencias: listaAlumnos.map(a => ({ alumnoId: a.id, status: a.status }))
      };
      fetch('http://localhost:8080/api/asistencia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(res => { if(res.ok) alert('¡Asistencia guardada!'); })
      .catch(err => alert(err));
    };

    const handleStatusChange = (id, val) => {
        setListaAlumnos(listaAlumnos.map(a => a.id === id ? {...a, status: val} : a));
    }

    // --- LÓGICA MODO REPORTE (SÁBANA) ---
    // Genera la tabla grande con fechas en columnas
    const handleGenerarReporte = () => {
      if (!selectedCourse) return;
      setIsLoading(true);
      
      // Calcular array de fechas para las columnas del Excel
      const getDaysArray = (start, end) => {
        for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
            arr.push(new Date(dt).toISOString().split('T')[0]);
        }
        return arr;
      };
      const dias = getDaysArray(fechaInicio, fechaFin);
      setDiasReporte(dias);

      fetch(`http://localhost:8080/api/asignaciones/${selectedCourse}/reporte-asistencia?inicio=${fechaInicio}&fin=${fechaFin}`)
        .then(res => res.json())
        .then(data => setDatosReporte(data))
        .finally(() => setIsLoading(false));
    };

    // Función para pintar la celda del Excel (Verde=P, Roja=A)
    const renderCelda = (status) => {
        if (status === 'presente') return <span style={{color:'green', fontWeight:'bold'}}>P</span>;
        if (status === 'ausente') return <span style={{color:'red', fontWeight:'bold'}}>A</span>;
        if (status === 'tardanza') return <span style={{color:'#d97706', fontWeight:'bold'}}>R</span>;
        return <span style={{color:'#cbd5e1'}}>-</span>; // Sin registro
    };

    return (
      <>
        {/* ESTILOS DE IMPRESIÓN PARA SÁBANA DE ASISTENCIA */}
        <style>{`
          @media print {
            @page { size: landscape; margin: 10mm; } /* Hoja Horizontal */
            body { font-family: 'Arial', sans-serif; -webkit-print-color-adjust: exact; }
            .no-print, .sidebar, .btn-primary, button, .tabs { display: none !important; }
            .dashboard-layout, .main-content { display: block !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
            .card { border: none !important; padding: 0 !important; box-shadow: none !important; }
            
            /* Tabla Sábana Impresa */
            .sabana-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
            .sabana-table th, .sabana-table td { border: 1px solid #000; padding: 4px; text-align: center; }
            .sabana-table th { background-color: #eee !important; }
            .sabana-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; }
          }
          .print-only { display: none; }
        `}</style>

        {/* --- HEADER --- */}
        <div className="no-print" style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom:'20px'}}>
          <button onClick={() => setTeacherVista('misCursos')} className="btn-secondary" style={{padding: '10px'}}>
            <ArrowLeft size={20} />
          </button>
          <div>
             <h1 className="header-title">Control de Asistencia</h1>
             <p className="header-subtitle">Gestiona faltas y retardos.</p>
          </div>
        </div>

        {/* --- PESTAÑAS --- */}
        {/* Botones para cambiar entre pasar lista hoy o ver el reporte */}
        <div className="tabs no-print" style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
            <button 
                onClick={() => setModo('diario')}
                className={modo === 'diario' ? 'btn-primary' : 'btn-secondary'}
                style={{flex:1, justifyContent:'center'}}
            >
                Pasar Lista (Día)
            </button>
            <button 
                onClick={() => setModo('reporte')}
                className={modo === 'reporte' ? 'btn-primary' : 'btn-secondary'}
                style={{flex:1, justifyContent:'center'}}
            >
                Ver Historial (Reporte)
            </button>
        </div>

        {/* ==================== LISTA DIARIA  ==================== */}
        {modo === 'diario' && (
            <>
                <div className="card no-print" style={{borderLeft: '4px solid var(--accent)'}}>
                    <div className="form-grid" style={{alignItems: 'flex-end', gridTemplateColumns: '2fr 1fr auto'}}>
                        <Select label="Curso" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} options={misAsignaciones} labelKey={a => `${a.materia.nombreMateria} - ${a.turno.nombreTurno}`} />
                        <Input label="Fecha" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                        <button onClick={handleCargarLista} className="btn-primary" disabled={isLoading}>{isLoading ? '...' : 'Cargar'}</button>
                    </div>
                </div>

                {listaCargada && (
                    <div className="card table-container" style={{marginTop: '20px'}}>
                        <div className="no-print" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                            <h3 style={{margin:0}}>Lista del: {selectedDate}</h3>
                            <button onClick={() => window.print()} className="btn-secondary" style={{fontSize:'0.8em'}}><Save size={14}/> Imprimir Día</button>
                        </div>
                        {/* Tabla diaria simple */}
                        <table>
                            <thead><tr><th>Alumno</th><th style={{textAlign:'center'}}>Estatus</th></tr></thead>
                            <tbody>
                                {listaAlumnos.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.apellido}, {a.nombre}</td>
                                        <td style={{textAlign:'center'}}>
                                            <div className="no-print" style={{display:'flex', justifyContent:'center', gap:'5px'}}>
                                                {['presente','ausente','tardanza'].map(s => (
                                                    <RadioAsistencia key={s} label={s.charAt(0).toUpperCase()+s.slice(1)} name={`as-${a.id}`} value={s} checked={a.status===s} onChange={e=>handleStatusChange(a.id, e.target.value)}/>
                                                ))}
                                            </div>
                                            {/* Texto para imprimir */}
                                            <span style={{display:'none'}} className="print-show">{a.status.toUpperCase()}</span> 
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="no-print" style={{textAlign:'right', marginTop:'15px'}}>
                            <button onClick={handleGuardarAsistencia} className="btn-primary">Guardar Asistencia</button>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* ==================== REPORTE ASISTENCIA ==================== */}
        {modo === 'reporte' && (
            <>
                <div className="card no-print" style={{borderLeft: '4px solid #8b5cf6'}}>
                    <h3 style={{marginTop:0}}>Generar Historial de Asistencia</h3>
                    <div className="form-grid" style={{alignItems: 'flex-end', gridTemplateColumns: '2fr 1fr 1fr auto'}}>
                        <Select label="Curso" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} options={misAsignaciones} labelKey={a => a.materia.nombreMateria} />
                        <Input label="Desde" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                        <Input label="Hasta" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                        <button onClick={handleGenerarReporte} className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Generando...' : 'Ver Reporte'}
                        </button>
                    </div>
                </div>

                {datosReporte.length > 0 && (
                    <div className="card table-container" style={{marginTop: '20px', overflowX: 'auto'}}>
                        {/* Header Impreso */}
                        <div className="print-only sabana-header" style={{display: 'none'}}>
                            <h2>Reporte de Asistencias</h2>
                            <p>{cursoActual?.materia.nombreMateria} | Del {fechaInicio} al {fechaFin}</p>
                        </div>

                        <div className="no-print" style={{display:'flex', justifyContent:'flex-end', marginBottom:'10px'}}>
                             <button onClick={() => window.print()} className="btn-secondary"><Save size={14}/> Imprimir / PDF</button>
                        </div>

                        <table className="sabana-table">
                            <thead>
                                <tr>
                                    <th style={{textAlign:'left', minWidth:'200px'}}>Alumno</th>
                                    {diasReporte.map(dia => (
                                        // Mostramos solo día y mes para ahorrar espacio (ej: 12/12)
                                        <th key={dia} style={{width:'30px', fontSize:'0.8em'}}>
                                            {dia.slice(8,10)}/{dia.slice(5,7)}
                                        </th>
                                    ))}
                                    <th style={{background:'#f0f9ff'}}>% Asist.</th>
                                    <th style={{background:'#fee2e2'}}>Faltas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosReporte.map(alumno => (
                                    <tr key={alumno.id}>
                                        <td style={{fontWeight:'500'}}>{alumno.apellido}, {alumno.nombre}</td>
                                        {diasReporte.map(dia => (
                                            <td key={dia} style={{textAlign:'center', border:'1px solid #e2e8f0'}}>
                                                {renderCelda(alumno.asistencias[dia])}
                                            </td>
                                        ))}
                                        {/* COLUMNAS DE RESUMEN AUTOMÁTICO */}
                                        <td style={{textAlign:'center', fontWeight:'bold', background:'#f0f9ff'}}>
                                            {alumno.totalPresentes}
                                        </td>
                                        <td style={{textAlign:'center', fontWeight:'bold', color:'red', background:'#fee2e2'}}>
                                            {alumno.totalAusentes}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p style={{fontSize:'0.8em', color:'#64748b', marginTop:'10px'}}>
                            * P = Presente, A = Ausente, R = Retardo/Tardanza
                        </p>
                    </div>
                )}
            </>
        )}
      </>
    );
  };

  // Componente que agrupa las funciones exclusivas para Profesores
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
                <p>No tienes cursos asignados.</p>
              </div>
            )}
          </>
        )}
        
        {teacherVista === 'verAlumnos' && selectedAsignacion && (
          <AlumnosCursoVista asignacion={selectedAsignacion} alumnos={alumnosCurso} />
        )}
        {teacherVista === 'bibliotecaRecursos' && (
          <RecursosVista misAsignaciones={misAsignaciones} />
        )}
        {teacherVista === 'controlAsistencia' && (
          <AsistenciaVista misAsignaciones={misAsignaciones} />
        )}
      </>
    );
  };

  // --- RENDERIZADO PRINCIPAL ---
  // Aquí decidimos qué mostrar en pantalla

  // Si no ha iniciado sesión, mostramos el Login
  if (!usuario) {
    return <Login onLogin={(datosUsuario) => setUsuario(datosUsuario)} />;
  }

  // Si ya inició sesión, mostramos el Dashboard
  return (
    <div className="dashboard-layout">
      
      {/* SIDEBAR DE NAVEGACIÓN (Barra lateral izquierda) */}
      <aside className="sidebar">
        <div className="brand"><School size={28} /><span>EduPortal</span></div>

        <div style={{ padding: '0 20px', marginBottom: '20px', fontSize: '0.8em', color: '#94a3b8' }}>
            Hola, {usuario.nombre} <br/>
            <span style={{color: 'var(--accent)', textTransform: 'uppercase'}}>{usuario.rol}</span>
        </div>

        <nav className="nav-menu">
          {/* Mostramos botones diferentes dependiendo si es Admin o Docente */}
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

      {/* ÁREA DE CONTENIDO (Donde aparecen las tablas y formularios) */}
      <main className="main-content">
        
        {vista === 'dashboardDocente' && usuario.rol === 'docente' && (
          <TeacherDashboard usuario={usuario} asignaciones={asignaciones} />
        )}
        
        {/* VISTAS ADMIN CON TABLAS */}
        {/* Vista de Gestión de Alumnos */}
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
            {/* TABLA ALUMNOS */}
            <Table data={alumnos} columns={['matricula', 'nombre', 'apellido', 'direccion']} />
          </>
        )}

        {/* Vista de Gestión de Maestros */}
        {vista === 'maestros' && usuario.rol === 'admin' && (
          <>
            <PageHeader title="Plantilla Docente" subtitle="Administración de profesores." />
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
            <Table data={maestros} columns={['nombre', 'apellido', 'email', 'telefono']} />
          </>
        )}

        {/* Vista de Gestión de Materias */}
        {vista === 'materias' && usuario.rol === 'admin' && (
          <>
            <PageHeader title="Catálogo de Materias" subtitle="Configuración de asignaturas." />
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

        {/* Vista de Gestión de Turnos */}
        {vista === 'turnos' && usuario.rol === 'admin' && (
          <>
            <PageHeader title="Gestión de Turnos" subtitle="Horarios disponibles." />
            <div className="card" style={{maxWidth: '500px'}}>
              <form onSubmit={(e) => enviarFormulario(e, 'turnos', nuevoTurno, setNuevoTurno, initialTurno, setTurnos)} style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
                <Input label="Nombre del Turno" name="nombreTurno" value={nuevoTurno.nombre_turno} onChange={(e) => handleChange(e, setNuevoTurno, nuevoTurno)} required style={{flex: 1}}/>
                <button type="submit" className="btn-primary">Crear</button>
              </form>
            </div>
            <Table data={turnos} columns={['nombreTurno']} />
          </>
        )}

        {/* Vista de Asignaciones: Une Maestro + Materia + Turno */}
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
            {/* TABLA DE ASIGNACIONES + BOTÓN DE INSCRIBIR */}
            <div className="card table-container">
              <table>
                <thead>
                  <tr><th>ID</th><th>Docente</th><th>Materia Asignada</th><th>Turno</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {asignaciones.map(a => (
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td style={{fontWeight: 500}}>{a.maestro ? `${a.maestro.nombre} ${a.maestro.apellido}` : '---'}</td>
                      <td><span style={{background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em'}}>{a.materia ? a.materia.nombre_materia : '---'}</span></td>
                      <td>{a.turno ? a.turno.nombre_turno : '---'}</td>
                      <td>
                        {/* Botón Inscribir Alumnos (Admin) */}
                        <button className="btn-secondary" style={{padding: '6px 12px', fontSize: '0.85em', display: 'flex', gap: '5px', alignItems: 'center'}} onClick={() => setAsignacionParaInscribir(a)}>
                          <UserPlus size={16}/> Inscribir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MODAL PARA INSCRIBIR: Solo aparece si hay una asignación seleccionada */}
            {asignacionParaInscribir && (
              <InscripcionModal asignacion={asignacionParaInscribir} allAlumnos={alumnos} onClose={() => setAsignacionParaInscribir(null)} />
            )}
          </>
        )}

      </main>
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---
// Pequeños componentes para no repetir código HTML (inputs, botones, tablas)

const NavButton = ({ active, onClick, icon, label }) => (
  <button className={`nav-btn ${active ? 'active' : ''}`} onClick={onClick}>
    {icon} <span>{label}</span>
  </button>
);

// tablas
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

const RadioAsistencia = ({ label, ...props }) => (
  <label className="radio-asistencia">
    <input type="radio" {...props} />
    <span>{label}</span>
  </label>
);

export default App;