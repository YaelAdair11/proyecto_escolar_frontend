import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

// Input genérico para no repetir tanto código HTML
export const Input = ({ label, ...props }) => (
  <div className="input-group" style={props.style}>
    {label && <label>{label}</label>}
    <input {...props} className="input-field"/>
  </div>
);

// Select genérico
export const Select = ({ label, options, labelKey, ...props }) => (
  <div className="input-group">
    <label>{label}</label>
    <select {...props} className="input-field">
      <option value="">-- Seleccionar --</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {/* A veces el label es una funcion, a veces una propiedad */}
          {typeof labelKey === 'function' ? labelKey(opt) : opt[labelKey]}
        </option>
      ))}
    </select>
  </div>
);

// Header de cada pagina
export const PageHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: '30px' }}>
    <h1 className="header-title">{title}</h1>
    <p className="header-subtitle">{subtitle}</p>
  </div>
);

export const NavButton = ({ active, onClick, icon, label }) => (
  <button className={`nav-btn ${active ? 'active' : ''}`} onClick={onClick}>
    {icon} <span>{label}</span>
  </button>
);

// Radio button para asistencia (TAMBIÉN TE FALTA ESTE)
export const RadioAsistencia = ({ label, ...props }) => (
  <label className="radio-asistencia">
    <input type="radio" {...props} />
    <span>{label}</span>
  </label>
);

// Tabla reutilizable con botones de editar y borrar
export const Table = ({ data, columns, onEdit, onDelete }) => (
  <div className="card table-container">
    <table>
      <thead>
        <tr>
          {columns.map(c => <th key={c}>{c.replace('_', ' ')}</th>)}
          {(onEdit || onDelete) && <th style={{width: '100px', textAlign: 'center'}}>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? data.map(row => (
          <tr key={row.id}>
            {columns.map(col => <td key={col}>{row[col]}</td>)}
            {(onEdit || onDelete) && (
              <td style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                {onEdit && (
                  <button onClick={() => onEdit(row)} className="btn-icon btn-edit" title="Editar">
                    <Pencil size={16} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(row.id)} className="btn-icon btn-delete" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                )}
              </td>
            )}
          </tr>
        )) : (
          <tr>
            <td colSpan={columns.length + 1} style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
              No hay registros disponibles.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);