import { useState, useEffect } from 'react';
import { PageHeader, Input, Table } from '../../componentes/ComponentesReusables';

const AdminAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [editId, setEditId] = useState(null);
  
  // Estado inicial del formulario
  const initialForm = { matricula: '', nombre: '', apellido: '', direccion: '', fechaNacimiento: '' };
  const [form, setForm] = useState(initialForm);

  // Cargar datos al entrar
  useEffect(() => {
    cargarAlumnos();
  }, []);

  const cargarAlumnos = () => {
    fetch('http://localhost:8080/api/alumnos')
      .then(res => res.json())
      .then(data => setAlumnos(data))
      .catch(console.error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId 
      ? `http://localhost:8080/api/alumnos/${editId}` 
      : 'http://localhost:8080/api/alumnos';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(res => {
        if(!res.ok) throw new Error("Error");
        return res.json();
    })
    .then(() => {
        alert(editId ? 'Alumno actualizado' : 'Alumno registrado');
        setForm(initialForm);
        setEditId(null);
        cargarAlumnos(); // Recargar la tabla
    })
    .catch(() => alert('Ocurrió un error al guardar.'));
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm(item); // Rellena el form con los datos del alumno
  };

  const handleDelete = (id) => {
    if(!confirm('¿Seguro que deseas eliminar este alumno?')) return;
    fetch(`http://localhost:8080/api/alumnos/${id}`, { method: 'DELETE' })
      .then(res => {
         if(res.ok) cargarAlumnos();
         else alert('No se pudo eliminar');
      });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(initialForm);
  };

  return (
    <div>
      <PageHeader title="Directorio de Alumnos" subtitle="Gestiona la información de los estudiantes." />
      
      <div className="card" style={editId ? {borderLeft: '4px solid #f59e0b'} : {}}>
        <h3 style={{marginTop:0}}>{editId ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input label="Matrícula" value={form.matricula} onChange={e => setForm({...form, matricula: e.target.value})} required />
            <Input label="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
            <Input label="Apellido" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} required />
            <Input label="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
            <Input label="Fecha Nac." type="date" value={form.fechaNacimiento} onChange={e => setForm({...form, fechaNacimiento: e.target.value})} />
          </div>
          <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
             <button type="submit" className="btn-primary">{editId ? 'Actualizar' : 'Registrar'}</button>
             {editId && <button type="button" onClick={handleCancel} className="btn-secondary">Cancelar</button>}
          </div>
        </form>
      </div>

      <Table 
        data={alumnos} 
        columns={['matricula', 'nombre', 'apellido', 'direccion']} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default AdminAlumnos;