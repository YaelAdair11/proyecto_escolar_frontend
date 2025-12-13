import { useState } from 'react';
import { BookOpen, Users } from 'lucide-react';
// Asegúrate de que la ruta a ComponentesReusables sea correcta según tus carpetas
import { PageHeader } from '../../componentes/ComponentesReusables';
import Recursos from './Recursos';
import Asistencia from './Asistencia';
import Calificaciones from './Calificaciones';

// Recibimos 'vista' y 'setVista' desde App.jsx
const TeacherDashboard = ({ usuario, asignaciones, vista, setVista }) => {
  
  // Filtramos solo las materias de este maestro
  const misAsignaciones = asignaciones.filter(a => a.maestro && a.maestro.id == usuario.id);
  
  // Estado local solo para datos internos (ya no para la navegación principal)
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [alumnosCurso, setAlumnosCurso] = useState([]);

  // Funcion para ir a calificar un grupo
  const handleVerAlumnos = (asignacion) => {
    setSelectedAsignacion(asignacion);
    fetch(`http://localhost:8080/api/asignaciones/${asignacion.id}/alumnos`)
      .then(res => res.json())
      .then(data => {
        const alumnosConCalificacion = data.map(a => ({ ...a, calificacion: a.calificacion ?? '' }));
        setAlumnosCurso(alumnosConCalificacion);
        // CORRECCIÓN: Usamos setVista, no setTeacherVista
        setVista('verAlumnos');
      })
      .catch(err => console.error("Error al cargar alumnos del curso:", err));
  };

  return (
    <>
      {/* CORRECCIÓN: Usamos 'vista', no 'teacherVista' */}
      {vista === 'misCursos' && (
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
      
      {/* Carga condicional de las otras vistas usando 'vista' */}
      {vista === 'verAlumnos' && selectedAsignacion && (
        <Calificaciones 
            asignacion={selectedAsignacion} 
            alumnos={alumnosCurso} 
            // CORRECCIÓN: Usamos setVista para volver
            onBack={() => setVista('misCursos')}
        />
      )}
      {vista === 'bibliotecaRecursos' && (
        <Recursos misAsignaciones={misAsignaciones} />
      )}
      {vista === 'controlAsistencia' && (
        <Asistencia misAsignaciones={misAsignaciones} />
      )}
    </>
  );
};

export default TeacherDashboard;