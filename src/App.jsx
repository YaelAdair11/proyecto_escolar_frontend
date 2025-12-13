import { useEffect, useState } from 'react';
import './App.css';

// 1. Importamos el Login y el Menú lateral
import Login from './vistas/Login';
import Navbar from './componentes/Navbar';

// 2. Importamos el Dashboard del Docente
import TeacherDashboard from './vistas/docente/PanelControlDocente';

// 3. Importamos las pantallas del Admin (las que acabamos de crear)
import AdminAlumnos from './vistas/admin/AdminAlumnos';
import AdminMaestros from './vistas/admin/AdminMaestros';
import AdminMaterias from './vistas/admin/AdminMaterias';
import AdminTurnos from './vistas/admin/AdminTurnos';
import AdminAsignaciones from './vistas/admin/AdminAsignaciones';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('alumnos'); // que pantalla ve el admin

  // Este estado lo mantenemos aquí porque el TeacherDashboard lo necesita
  // para filtrar cuáles son "sus" cursos.
  const [vistaDocente, setVistaDocente] = useState('misCursos');
  const [asignaciones, setAsignaciones] = useState([]);

  // Cada vez que alguien entra, cargamos la lista general de asignaciones
  // (El admin carga sus propios datos en sus vistas, pero esto sirve para el profe)
  useEffect(() => {
    if (usuario) {
      fetch('http://localhost:8080/api/asignaciones')
        .then(res => res.json())
        .then(setAsignaciones)
        .catch(err => console.error("Error cargando asignaciones", err));
    }
  }, [usuario]);

  // Si no hay usuario, mostramos la pantalla de Login

  if (!usuario) return <Login onLogin={setUsuario} />;

  return (
    <div className="dashboard-layout">
      
      {/* Barra de Navegación Lateral */}
      <Navbar 
        usuario={usuario} 
        vistaActual={vista} 
        cambiarVista={setVista} 
        vistaDocente={vistaDocente}      
        cambiarVistaDocente={setVistaDocente} 
        onLogout={() => setUsuario(null)} 
      />

      {/* Área Principal de Contenido */}
      <main className="main-content">
        
        {/* --- LÓGICA DEL DOCENTE --- */}
        {usuario.rol === 'docente' && (
          <TeacherDashboard 
            usuario={usuario} 
            asignaciones={asignaciones}
            // Le pasamos el control al panel también
            vista={vistaDocente} 
            setVista={setVistaDocente} 
          />
        )}

        {/* --- LÓGICA DEL ADMIN --- */}
        {usuario.rol === 'admin' && (
          <>
            {/* Mostramos el componente según la pestaña seleccionada en el Navbar */}
            {vista === 'alumnos' && <AdminAlumnos />}
            {vista === 'maestros' && <AdminMaestros />}
            {vista === 'materias' && <AdminMaterias />}
            {vista === 'turnos' && <AdminTurnos />}
            {vista === 'asignaciones' && <AdminAsignaciones />}
          </>
        )}

      </main>
    </div>
  );
}

export default App;