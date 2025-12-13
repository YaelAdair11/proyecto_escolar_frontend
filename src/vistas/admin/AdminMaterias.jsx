import { useState, useEffect } from 'react';
import { PageHeader, Input, Table } from '../../componentes/ComponentesReusables';

const AdminMaterias = () => {
  const [materias, setMaterias] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ claveMateria: '', nombreMateria: '' });

  useEffect(() => {
    fetch('http://localhost:8080/api/materias').then(r => r.json()).then(setMaterias);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editId ? `http://localhost:8080/api/materias/${editId}` : 'http://localhost:8080/api/materias';
    fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
    }).then(() => {
        alert('Guardado');
        setForm({ claveMateria: '', nombreMateria: '' });
        setEditId(null);
        fetch('http://localhost:8080/api/materias').then(r => r.json()).then(setMaterias);
    });
  };

  return (
    <div>
      <PageHeader title="Catálogo de Materias" subtitle="Configuración de asignaturas." />
      <div className="card">
        <h3 style={{marginTop:0}}>{editId ? 'Editar' : 'Nueva'} Materia</h3>
        <form onSubmit={handleSubmit} style={{display:'flex', alignItems:'flex-end', gap:'15px'}}>
            <Input label="Clave" value={form.claveMateria} onChange={e => setForm({...form, claveMateria:e.target.value})} required />
            <Input label="Nombre Materia" value={form.nombreMateria} onChange={e => setForm({...form, nombreMateria:e.target.value})} required style={{flex:2}} />
            <button className="btn-primary" style={{marginBottom:'2px'}}>{editId ? 'Actualizar' : 'Agregar'}</button>
            {editId && <button type="button" onClick={() => {setEditId(null); setForm({claveMateria:'', nombreMateria:''})}} className="btn-secondary" style={{marginBottom:'2px'}}>Cancelar</button>}
        </form>
      </div>
      <Table data={materias} columns={['claveMateria', 'nombreMateria']} onEdit={(item)=>{setEditId(item.id); setForm(item);}} onDelete={(id)=>{
          if(confirm('¿Borrar?')) fetch(`http://localhost:8080/api/materias/${id}`, {method:'DELETE'}).then(()=>fetch('http://localhost:8080/api/materias').then(r=>r.json()).then(setMaterias));
      }} />
    </div>
  );
};

export default AdminMaterias;