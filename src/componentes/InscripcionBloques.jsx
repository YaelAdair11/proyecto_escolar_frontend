import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const InscripcionModal = ({ asignacion, onClose, allAlumnos }) => {
  const [inscritos, setInscritos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir, vemos quien ya esta inscrito
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

  // Checkbox: si esta lo quita, si no esta lo pone
  const toggleAlumno = (id) => {
    if (inscritos.includes(id)) {
      setInscritos(inscritos.filter(i => i !== id));
    } else {
      setInscritos([...inscritos, id]);
    }
  };

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
          <button className="btn-secondary btn-icon btn-cancel btn-cancel2" onClick={onClose}><X size={16}/> Cancelar</button>
          <button className="btn-primary" onClick={handleGuardar}>Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default InscripcionModal;