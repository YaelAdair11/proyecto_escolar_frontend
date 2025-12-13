import { useState, useEffect } from 'react';
import { BookOpen, Library, Save, X, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, Input, Select } from '../../componentes/ComponentesReusables';

const Recursos = ({ misAsignaciones }) => {
  const [selectedCourse, setSelectedCourse] = useState(misAsignaciones[0]?.id || '');
  const [recursos, setRecursos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Estado del formulario
  const [form, setForm] = useState({ title: '', type: 'link', link: '', file: null, base64: '' });

  // Recarga al cambiar de materia
  useEffect(() => {
    if (!selectedCourse) { setRecursos([]); return; };
    cargarRecursos();
    cancelEdit(); 
  }, [selectedCourse]);

  const cargarRecursos = () => {
    setIsLoading(true);
    fetch(`http://localhost:8080/api/asignaciones/${selectedCourse}/recursos`)
      .then(res => res.json())
      .then(data => setRecursos(data))
      .catch(err => console.error("Error:", err))
      .finally(() => setIsLoading(false));
  };

  // Convertir archivo a Base64 para guardarlo fácil en BD
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
        alert('El archivo es demasiado grande (Máximo 5MB).');
        e.target.value = null; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, file: file, base64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const isValidUrl = (urlString) => {
      try { return Boolean(new URL(urlString)); } catch(e){ return false; }
  }

  const handleEdit = (recurso) => {
      setEditId(recurso.id);
      setForm({
          title: recurso.titulo,
          type: recurso.tipo, 
          link: recurso.tipo === 'link' ? recurso.url : '',
          file: null, 
          base64: recurso.tipo === 'file' ? recurso.archivoBase64 : '' 
      });
      // Scroll hacia arriba
      document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
      setEditId(null);
      setForm({ title: '', type: 'link', link: '', file: null, base64: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('El campo "Título" es obligatorio.'); return; }
    
    if (form.type === 'link') {
      if (!form.link) { alert('Debes escribir una URL.'); return; }
      if (!isValidUrl(form.link)) { alert('La URL no es válida (usa http:// o https://)'); return; }
    } else if (form.type === 'file') {
      if (!form.base64) { alert('Por favor selecciona un archivo.'); return; }
    }

    const payload = {
      titulo: form.title,
      type: form.type,
      url: form.type === 'link' ? form.link : '',
      archivoBase64: form.type === 'file' ? form.base64 : '',
      asignacionId: selectedCourse
    };

    const url = editId 
      ? `http://localhost:8080/api/recursos/${editId}` 
      : 'http://localhost:8080/api/recursos';
    
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error del servidor');
      return data;
    })
    .then(recursoGuardado => {
      alert(editId ? '¡Recurso actualizado!' : '¡Recurso creado!');
      if (editId) {
          setRecursos(recursos.map(r => r.id === editId ? recursoGuardado : r));
      } else {
          setRecursos([...recursos, recursoGuardado]);
      }
      cancelEdit(); 
    })
    .catch(err => alert("Error: " + err.message));
  };

  const handleDelete = (id) => {
    if(!window.confirm("¿Seguro que quieres borrar este recurso?")) return;
    fetch(`http://localhost:8080/api/recursos/${id}`, { method: 'DELETE' })
    .then(res => {
      if(res.ok) {
        setRecursos(recursos.filter(r => r.id !== id));
        if (editId === id) cancelEdit(); 
      } else {
        alert('No se pudo eliminar el recurso.');
      }
    });
  };

  // Truco para bajar el archivo con la extension correcta
  const getExtensionFromBase64 = (base64String) => {
    if (!base64String) return '.bin';
    if (base64String.startsWith('data:application/pdf')) return '.pdf';
    if (base64String.startsWith('data:image/png')) return '.png';
    if (base64String.startsWith('data:image/jpeg')) return '.jpg';
    if (base64String.startsWith('data:application/msword')) return '.doc';
    return '.bin'; 
  };

  return (
    <>
      <PageHeader title="Biblioteca de Recursos" subtitle="Gestiona enlaces y documentos." />

      <div className="card" style={{borderLeft: editId ? '4px solid #f59e0b' : '4px solid var(--accent)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
           <h3 style={{margin:0}}>{editId ? 'Editar Recurso' : 'Agregar Nuevo Recurso'}</h3>
           {editId && (
              <button onClick={cancelEdit} className="btn-secondary btn-icon btn-cancel" style={{fontSize: '0.8rem', padding: '8px 10px'}}>
                  <X size={14} style={{marginRight: 4}}/> Cancelar
              </button>
           )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Select 
              label="Curso Destino" 
              value={selectedCourse || ''}
              onChange={e => setSelectedCourse(e.target.value)} 
              options={misAsignaciones} 
              labelKey={a => a.materia.nombreMateria} 
              style={{gridColumn: 'span 2'}} 
              disabled={!!editId} 
            />
            
            <Input 
              label="Título" 
              value={form.title || ''}
              onChange={e => setForm({...form, title: e.target.value})} 
              required 
            />
            
            <div className="input-group">
              <label>Formato</label>
              <select className="input-field" value={form.type || ''} onChange={e => setForm({...form, type: e.target.value, link: '', base64: '', file: null})}>
                <option value="link">Enlace Web</option>
                <option value="file">Documento (PDF/Imagen)</option>
              </select>
            </div>

            {form.type === 'link' ? (
              <Input 
                  label="URL" 
                  value={form.link || ''} 
                  onChange={e => setForm({...form, link: e.target.value})} 
                  placeholder="https://..." 
                  style={{gridColumn: 'span 2'}} 
              />
            ) : (
              <div className="input-group" style={{gridColumn: 'span 2'}}>
                <label>Archivo (Max 5MB)</label>
                <input type="file" className="input-field" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFileChange} />
                {editId && form.base64 && !form.file && (
                    <div style={{fontSize: '0.85em', color: '#10b981', marginTop: '5px'}}>
                        ✓ Archivo actual cargado.
                    </div>
                )}
              </div>
            )}
          </div>
          
          <button type="submit" className="btn-primary" style={{marginTop: '15px'}}>
              <Save size={16} style={{marginRight:5}}/> Guardar
          </button>
        </form>
      </div>

      <div className="card table-container" style={{marginTop: '30px'}}>
        {isLoading ? <p>Cargando...</p> : (
          <table>
            <thead><tr><th>Recurso</th><th>Tipo</th><th>Fecha</th><th style={{textAlign:'right'}}>Acciones</th></tr></thead>
            <tbody>
              {recursos.length > 0 ? recursos.map(res => (
                <tr key={res.id}>
                  <td>
                      <div style={{display:'flex', alignItems:'center', gap:'10px', fontWeight:'500'}}>
                          {res.tipo === 'link' ? <BookOpen size={18} color="#2563eb"/> : <Library size={18} color="#ea580c"/>}
                          {res.titulo}
                      </div>
                  </td>
                  <td>{res.tipo === 'link' ? 'ENLACE' : 'ARCHIVO'}</td>
                  <td>{new Date(res.createdAt).toLocaleDateString()}</td>
                  <td style={{textAlign:'right'}}>
                    <div style={{display:'flex', justifyContent:'flex-end', gap:'8px'}}>
                      {res.tipo === 'link' ? (
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{padding:'6px 10px'}}>Abrir</a>
                      ) : (
                        <a 
                          href={res.archivoBase64} 
                          download={`${res.titulo}${getExtensionFromBase64(res.archivoBase64)}`} 
                          className="btn-secondary" 
                          style={{padding:'6px 10px'}}
                        >
                          Bajar
                        </a>
                      )}
                      <button onClick={() => handleEdit(res)} className="btn-icon btn-edit"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(res.id)} className="btn-icon btn-delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Sin recursos.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Recursos;