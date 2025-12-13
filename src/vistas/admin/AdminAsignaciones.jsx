import { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, Select, Table } from '../../componentes/ComponentesReusables';
import InscripcionModal from '../../componentes/InscripcionBloques';

const AdminAsignaciones = () => {
  // Datos necesarios para los selects
  const [maestros, setMaestros] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]); // Para el modal

  // Estados de control
  const [editId, setEditId] = useState(null);
  const [asignacionParaInscribir, setAsignacionParaInscribir] = useState(null);

  const initialForm = { maestro_id: '', materia_id: '', turno_id: '' };
  const [form, setForm] = useState(initialForm);

  // Cargar TODO al inicio (Student style: muchos fetch juntos)
  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = () => {
    fetch('http://localhost:8080/api/maestros').then(r=>r.json()).then(setMaestros);
    fetch('http://localhost:8080/api/materias').then(r=>r.json()).then(setMaterias);
    fetch('http://localhost:8080/api/turnos').then(r=>r.json()).then(setTurnos);
    fetch('http://localhost:8080/api/alumnos').then(r=>r.json()).then(setAlumnos);
    recargarAsignaciones();
  };

  const recargarAsignaciones = () => {
    fetch('http://localhost:8080/api/asignaciones').then(r=>r.json()).then(setAsignaciones);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editId ? `http://localhost:8080/api/asignaciones/${editId}` : 'http://localhost:8080/api/asignaciones';
    fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
    }).then(() => {
        alert('Carga académica guardada');
        setForm(initialForm);
        setEditId(null);
        recargarAsignaciones();
    });
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    // Extraemos solo los IDs para que los Selects funcionen
    setForm({
        maestro_id: item.maestro?.id || '',
        materia_id: item.materia?.id || '',
        turno_id: item.turno?.id || ''
    });
  };

  const handleDelete = (id) => {
      if(confirm('¿Eliminar esta asignación?')) {
          fetch(`http://localhost:8080/api/asignaciones/${id}`, {method:'DELETE'}).then(recargarAsignaciones);
      }
  };

  return (
    <div>
      <PageHeader title="Carga Académica" subtitle="Vinculación de docentes, materias y horarios." />
      
      <div className="card" style={{borderLeft: '4px solid var(--accent)'}}>
        <h3 style={{marginTop:0}}>{editId ? 'Editar Asignación' : 'Nueva Asignación'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Select label="Docente" value={form.maestro_id} onChange={e => setForm({...form, maestro_id: e.target.value})} options={maestros} labelKey={m => `${m.nombre} ${m.apellido}`} />
            <Select label="Materia" value={form.materia_id} onChange={e => setForm({...form, materia_id: e.target.value})} options={materias} labelKey="nombreMateria" />
            <Select label="Turno" value={form.turno_id} onChange={e => setForm({...form, turno_id: e.target.value})} options={turnos} labelKey="nombreTurno" />
          </div>
          <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
             <button type="submit" className="btn-primary">{editId ? 'Actualizar Carga' : 'Asignar Carga'}</button>
             {editId && <button type="button" onClick={() => {setEditId(null); setForm(initialForm)}} className="btn-secondary">Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Tabla Manual porque necesitamos botones extra */}
      <div className="card table-container">
        <table>
            <thead><tr><th>ID</th><th>Docente</th><th>Materia</th><th>Turno</th><th style={{textAlign:'center'}}>Acciones</th></tr></thead>
            <tbody>
                {asignaciones.map(a => (
                <tr key={a.id}>
                    <td>#{a.id}</td>
                    <td>{a.maestro ? `${a.maestro.nombre} ${a.maestro.apellido}` : '---'}</td>
                    <td><span className="badge link" style={{fontSize:'0.85em'}}>{a.materia ? a.materia.nombreMateria : '---'}</span></td>
                    <td>{a.turno ? a.turno.nombreTurno : '---'}</td>
                    <td style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                        {/* Botón Inscribir */}
                        <button className="btn-secondary btn-inscribe" style={{padding: '6px 10px', fontSize:'0.8em', fontWeight:'bold'}} onClick={() => setAsignacionParaInscribir(a)}>
                            <UserPlus size={16} style={{marginRight:'4px'}}/> Inscribir
                        </button>
                        
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(a)}><Pencil size={16}/></button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(a.id)}><Trash2 size={16}/></button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL */}
      {asignacionParaInscribir && (
        <InscripcionModal 
            asignacion={asignacionParaInscribir} 
            allAlumnos={alumnos} 
            onClose={() => setAsignacionParaInscribir(null)} 
        />
      )}
    </div>
  );
};

export default AdminAsignaciones;