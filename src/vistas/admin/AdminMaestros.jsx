import { useState, useEffect } from 'react';
import { PageHeader, Input, Table } from '../../componentes/ComponentesReusables';

const AdminMaestros = () => {
  const [maestros, setMaestros] = useState([]);
  const [editId, setEditId] = useState(null);
  
  const initialForm = { nombre: '', apellido: '', email: '', telefono: '', password: '' };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    cargarMaestros();
  }, []);

  const cargarMaestros = () => {
    fetch('http://localhost:8080/api/maestros')
      .then(res => res.json())
      .then(setMaestros)
      .catch(console.error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId 
      ? `http://localhost:8080/api/maestros/${editId}` 
      : 'http://localhost:8080/api/maestros';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(res => { if(!res.ok) throw new Error(); return res.json(); })
    .then(() => {
        alert(editId ? 'Docente actualizado' : 'Docente guardado');
        setForm(initialForm);
        setEditId(null);
        cargarMaestros();
    })
    .catch(() => alert('Error al guardar.'));
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm(item);
  };

  const handleDelete = (id) => {
    if(!confirm('¿Eliminar docente?')) return;
    fetch(`http://localhost:8080/api/maestros/${id}`, { method: 'DELETE' })
      .then(res => { if(res.ok) cargarMaestros(); });
  };

  return (
    <div>
      <PageHeader title="Plantilla Docente" subtitle="Administración de profesores." />
      
      <div className="card" style={editId ? {borderLeft: '4px solid #f59e0b'} : {}}>
        <h3 style={{marginTop:0}}>{editId ? 'Editar Docente' : 'Registrar Docente'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input label="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
            <Input label="Apellido" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <Input label="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
            <Input label="Contraseña" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editId ? '(Dejar vacío para no cambiar)' : ''} required={!editId} />
          </div>
          <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
             <button type="submit" className="btn-primary">{editId ? 'Actualizar' : 'Guardar'}</button>
             {editId && <button type="button" onClick={() => {setEditId(null); setForm(initialForm)}} className="btn-secondary">Cancelar</button>}
          </div>
        </form>
      </div>

      <Table 
        data={maestros} 
        columns={['nombre', 'apellido', 'email', 'telefono']} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default AdminMaestros;