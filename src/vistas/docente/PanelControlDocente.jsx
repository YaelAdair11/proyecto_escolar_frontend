import { useState } from 'react';
import { BookOpen, Users } from 'lucide-react';
// importo mis componentes
import { PageHeader } from '../../componentes/ComponentesReusables';
import Recursos from './Recursos';
import Asistencia from './Asistencia';
import Calificaciones from './Calificaciones';

const TeacherDashboard = ({ usuario, asignaciones, vista, setVista }) => {
  
  // filtrar solo las materias de este usuario
  const misAsignaciones = asignaciones.filter(a => a.maestro && a.maestro.id == usuario.id);
  
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [alumnosCurso, setAlumnosCurso] = useState([]);

  // cargar alumnos cuando entro a un curso
  const handleVerAlumnos = (asignacion) => {
    setSelectedAsignacion(asignacion);
    fetch(`http://localhost:8080/api/asignaciones/${asignacion.id}/alumnos`)
      .then(res => res.json())
      .then(data => {
        // si viene null le pongo string vacio para que no falle el input
        const alumnosConCalificacion = data.map(a => ({ ...a, calificacion: a.calificacion ?? '' }));
        setAlumnosCurso(alumnosConCalificacion);
        setVista('verAlumnos');
      })
      .catch(err => console.error("Error al cargar alumnos", err));
  };

  return (
    <>
      {/* vista principal: mis cursos */}
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
                    <p><strong>Turno:</strong> {asignacion.turno ? asignacion.turno.nombreTurno : '-'}</p>
                    <p><strong>Clave:</strong> {asignacion.materia ? asignacion.materia.claveMateria : '-'}</p>
                  </div>
                  <div className="course-card-footer">
                    <button className="btn-primary" onClick={() => handleVerAlumnos(asignacion)}>
                      <Users size={16} style={{marginRight: '8px'}}/>
                      Calificaciones del curso
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
      
      {/* carga de componentes segun el menu */}
      
      {vista === 'verAlumnos' && selectedAsignacion && (
        <Calificaciones 
            asignacion={selectedAsignacion} 
            alumnos={alumnosCurso} 
            // regresar al menu anterior
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