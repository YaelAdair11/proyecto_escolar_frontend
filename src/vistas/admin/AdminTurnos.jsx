import { useState, useEffect } from 'react';
import { PageHeader, Input, Table } from '../../componentes/ComponentesReusables';

const AdminTurnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [nombreTurno, setNombreTurno] = useState('');

  const recargar = () => fetch('http://localhost:8080/api/turnos').then(r => r.json()).then(setTurnos);

  useEffect(() => { recargar(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editId ? `http://localhost:8080/api/turnos/${editId}` : 'http://localhost:8080/api/turnos';
    fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreTurno })
    }).then(() => {
        alert('Guardado');
        setNombreTurno('');
        setEditId(null);
        recargar();
    });
  };

  return (
    <div>
      <PageHeader title="Gestión de Turnos" subtitle="Horarios disponibles." />
      <div className="card" style={{maxWidth: '500px'}}>
         <h3 style={{marginTop:0}}>{editId ? 'Editar' : 'Nuevo'} Turno</h3>
         <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', alignItems:'flex-end'}}>
             <Input label="Nombre" value={nombreTurno} onChange={e => setNombreTurno(e.target.value)} required style={{flex:1}}/>
             <button className="btn-primary" style={{marginBottom:'2px'}}>{editId ? 'Guardar' : 'Crear'}</button>
             {editId && <button type="button" onClick={()=>{setEditId(null); setNombreTurno('')}} className="btn-secondary" style={{marginBottom:'2px'}}>X</button>}
         </form>
      </div>
      <Table data={turnos} columns={['nombreTurno']} onEdit={(i)=>{setEditId(i.id); setNombreTurno(i.nombreTurno)}} onDelete={(id)=>{
          if(confirm('¿Borrar turno?')) fetch(`http://localhost:8080/api/turnos/${id}`, {method:'DELETE'}).then(recargar);
      }} />
    </div>
  );
};

export default AdminTurnos;