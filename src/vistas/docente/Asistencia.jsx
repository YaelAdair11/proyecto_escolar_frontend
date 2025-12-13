import { useState } from 'react';
import { Save } from 'lucide-react';
import { Select, Input, RadioAsistencia } from '../../componentes/ComponentesReusables';

const Asistencia = ({ misAsignaciones }) => {
  const [modo, setModo] = useState('diario'); // 'diario' o 'reporte'
  const [selectedCourse, setSelectedCourse] = useState(misAsignaciones[0]?.id || '');
  
  // Datos dia
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [listaAlumnos, setListaAlumnos] = useState([]);
  const [listaCargada, setListaCargada] = useState(false);
  
  // Datos reporte
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [datosReporte, setDatosReporte] = useState([]);
  const [diasReporte, setDiasReporte] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // Cargar lista del día
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

  // Generar la "sabana" de asistencia
  const handleGenerarReporte = () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    
    // Generar array de fechas entre inicio y fin
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

  const renderCelda = (status) => {
      if (status === 'presente') return <span style={{color:'green', fontWeight:'bold'}}>P</span>;
      if (status === 'ausente') return <span style={{color:'red', fontWeight:'bold'}}>A</span>;
      if (status === 'tardanza') return <span style={{color:'#d97706', fontWeight:'bold'}}>R</span>;
      return <span style={{color:'#cbd5e1'}}>-</span>;
  };

  return (
    <>
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          .no-print, .sidebar, .btn-primary, button, .tabs { display: none !important; }
          .dashboard-layout, .main-content { display: block !important; margin: 0 !important; width: 100% !important; }
          .card { border: none !important; padding: 0 !important; box-shadow: none !important; }
          .sabana-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
          .sabana-table th, .sabana-table td { border: 1px solid #000; padding: 4px; text-align: center; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="no-print">
         <h1 className="header-title">Control de Asistencia</h1>
      </div>

      <div className="tabs no-print" style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
          <button onClick={() => setModo('diario')} className={modo === 'diario' ? 'btn-primary' : 'btn-secondary'} style={{flex:1}}>Pasar Lista</button>
          <button onClick={() => setModo('reporte')} className={modo === 'reporte' ? 'btn-primary' : 'btn-secondary'} style={{flex:1}}>Historial</button>
      </div>

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
                      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                          <h3 style={{margin:0}}>Lista: {selectedDate}</h3>
                          <button onClick={() => window.print()} className="btn-secondary btn-imprimir"><Save size={14}/> Imprimir</button>
                      </div>
                      <table>
                          <thead><tr><th>Alumno</th><th style={{textAlign:'center'}}>Estatus</th></tr></thead>
                          <tbody>
                              {listaAlumnos.map(a => (
                                  <tr key={a.id}>
                                      <td>{a.apellido}, {a.nombre}</td>
                                      <td style={{textAlign:'center'}}>
                                          <div className="no-print" style={{display:'flex', justifyContent:'center', gap:'5px'}}>
                                              {['presente','ausente','tardanza'].map(s => (
                                                  <RadioAsistencia key={s} label={s.toUpperCase()} name={`as-${a.id}`} value={s} checked={a.status===s} onChange={e=>handleStatusChange(a.id, e.target.value)}/>
                                              ))}
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                      <div className="no-print" style={{textAlign:'right', marginTop:'15px'}}>
                          <button onClick={handleGuardarAsistencia} className="btn-primary">Guardar</button>
                      </div>
                  </div>
              )}
          </>
      )}

      {modo === 'reporte' && (
          <>
              <div className="card no-print" style={{borderLeft: '4px solid #8b5cf6'}}>
                  <div className="form-grid" style={{alignItems: 'flex-end', gridTemplateColumns: '2fr 1fr 1fr auto'}}>
                      <Select label="Curso" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} options={misAsignaciones} labelKey={a => a.materia.nombreMateria} />
                      <Input label="Desde" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                      <Input label="Hasta" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                      <button onClick={handleGenerarReporte} className="btn-primary" disabled={isLoading}>Ver Reporte</button>
                  </div>
              </div>

              {datosReporte.length > 0 && (
                  <div className="card table-container" style={{marginTop: '20px', overflowX: 'auto'}}>
                      <div className="print-only sabana-header">
                          <h2>Reporte de Asistencias</h2>
                      </div>
                      <div className="no-print" style={{display:'flex', justifyContent:'flex-end', marginBottom:'10px'}}>
                           <button onClick={() => window.print()} className="btn-secondary"><Save size={14}/> Imprimir</button>
                      </div>

                      <table className="sabana-table">
                          <thead>
                              <tr>
                                  <th style={{textAlign:'left'}}>Alumno</th>
                                  {diasReporte.map(dia => (
                                      <th key={dia} style={{width:'30px', fontSize:'0.8em'}}>{dia.slice(8,10)}/{dia.slice(5,7)}</th>
                                  ))}
                                  <th style={{background:'#f0f9ff'}}>Asist.</th>
                                  <th style={{background:'#fee2e2'}}>Faltas</th>
                              </tr>
                          </thead>
                          <tbody>
                              {datosReporte.map(alumno => (
                                  <tr key={alumno.id}>
                                      <td>{alumno.apellido}, {alumno.nombre}</td>
                                      {diasReporte.map(dia => (
                                          <td key={dia}>{renderCelda(alumno.asistencias[dia])}</td>
                                      ))}
                                      <td style={{textAlign:'center', background:'#f0f9ff'}}>{alumno.totalPresentes}</td>
                                      <td style={{textAlign:'center', color:'red', background:'#fee2e2'}}>{alumno.totalAusentes}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </>
      )}
    </>
  );
};

export default Asistencia;