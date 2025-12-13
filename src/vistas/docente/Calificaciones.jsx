import { useState, useEffect } from 'react';
import { Save, School, ArrowLeft } from 'lucide-react';
import { PageHeader, Input } from '../../componentes/ComponentesReusables';

const Calificaciones = ({ asignacion, alumnos, onBack }) => { 
  const [listaAlumnos, setListaAlumnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar alumnos con calificacion desde la BD
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

  const handleCalificacionChange = (alumnoId, nuevoValor) => {
    // Validacion simple 0-10
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
      {/* Estilos para impresión (Ocultar botones, etc) */}
      <style>{`
        @media print {
          @page { margin: 20mm; size: letter; }
          body { background: white; font-family: serif; color: #111; }
          .no-print, .sidebar, .btn-primary, .input-group label, button, ::-webkit-scrollbar { display: none !important; }
          .dashboard-layout, .main-content { display: block !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .card { box-shadow: none !important; border: none !important; padding: 0 !important; }
          .print-header, .course-info-grid, .signature-section { display: block !important; }
          input { border: none !important; background: transparent !important; font-weight: bold; color: black !important; text-align: center; }
        }
        .print-header, .course-info-grid, .signature-section { display: none; }
      `}</style>

      {/* Encabezado visible solo al imprimir */}
      <div className="print-header">
          <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'24px', fontWeight:'bold'}}>
             <School size={32} /> <span>Acta de Calificaciones</span>
          </div>
          <p>Fecha de emisión: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="no-print" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
        <button onClick={onBack} className="btn-secondary btn-back" style={{padding: '10px'}}>
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={`Calificaciones: ${asignacion.materia.nombreMateria}`}
          subtitle="Gestiona y reporta las evaluaciones del grupo." 
        />
      </div>

      <div className="card table-container" style={{border: 'none', boxShadow: 'none'}}>
        
        <div className="no-print" style={{textAlign: 'right', marginBottom: '15px'}}>
           <button onClick={() => window.print()} className="btn-secondary btn-imprimir" style={{display:'inline-flex', alignItems:'center', gap:'8px'}}>
              <Save size={16} /> Imprimir Acta Oficial
           </button>
        </div>

        {isLoading ? <p>Cargando datos...</p> : (
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
        )}
      </div>
    </>
  );
};

export default Calificaciones;