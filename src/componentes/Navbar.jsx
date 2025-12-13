import React from 'react';
// Agregamos Library y ClipboardCheck para los iconos nuevos
import { BookOpen, LogOut, LayoutDashboard, Users, GraduationCap, Clock, Library, ClipboardCheck } from 'lucide-react';
import { NavButton } from './ComponentesReusables';

// Recibimos las nuevas props: vistaDocente y cambiarVistaDocente
const Navbar = ({ usuario, vistaActual, cambiarVista, vistaDocente, cambiarVistaDocente, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <BookOpen size={28} />
        <span>EduPortal</span>
      </div>

      <div style={{ padding: '0 20px', marginBottom: '20px', fontSize: '0.8em', color: '#94a3b8' }}>
          Hola, {usuario.nombre} <br/>
          <span style={{color: 'var(--accent)', textTransform: 'uppercase'}}>
            {usuario.rol}
          </span>
      </div>

      <nav className="nav-menu">
        {/* MENÚ ADMIN */}
        {usuario.rol === 'admin' ? (
          <>
            <NavButton active={vistaActual === 'asignaciones'} onClick={() => cambiarVista('asignaciones')} icon={<LayoutDashboard size={20}/>} label="Carga Académica" />
            <NavButton active={vistaActual === 'alumnos'} onClick={() => cambiarVista('alumnos')} icon={<Users size={20}/>} label="Alumnos" />
            <NavButton active={vistaActual === 'maestros'} onClick={() => cambiarVista('maestros')} icon={<GraduationCap size={20}/>} label="Docentes" />
            <NavButton active={vistaActual === 'materias'} onClick={() => cambiarVista('materias')} icon={<BookOpen size={20}/>} label="Materias" />
            <NavButton active={vistaActual === 'turnos'} onClick={() => cambiarVista('turnos')} icon={<Clock size={20}/>} label="Turnos" />
          </>
        ) : (
          /* MENÚ DOCENTE (Aquí ponemos los botones que pediste) */
          <>
             <NavButton 
                active={vistaDocente === 'misCursos' || vistaDocente === 'verAlumnos'} 
                onClick={() => cambiarVistaDocente('misCursos')} 
                icon={<LayoutDashboard size={20}/>} 
                label="Mis Cursos" 
             />
             <NavButton 
                active={vistaDocente === 'bibliotecaRecursos'} 
                onClick={() => cambiarVistaDocente('bibliotecaRecursos')} 
                icon={<Library size={20}/>} 
                label="Recursos" 
             />
             <NavButton 
                active={vistaDocente === 'controlAsistencia'} 
                onClick={() => cambiarVistaDocente('controlAsistencia')} 
                icon={<ClipboardCheck size={20}/>} 
                label="Asistencias" 
             />
          </>
        )}
        
        <button className="nav-btn" onClick={onLogout} style={{color: '#f87171', marginTop: 'auto'}}>
          <LogOut size={20}/> <span>Cerrar Sesión</span>
        </button>
      </nav>
    </aside>
  );
};

export default Navbar;