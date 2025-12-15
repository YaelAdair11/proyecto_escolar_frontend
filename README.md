Sistema de Gestión Escolar - Frontend

Bienvenido al repositorio del Frontend. Esta es una **Single Page Application (SPA)** construida con **React y Vite**, diseñada para ofrecer una experiencia de usuario fluida y rápida para la gestión escolar.

## Enlaces Importantes
- **Repositorio:** [GitHub Frontend](https://github.com/YaelAdair11/proyecto_escolar_frontend.git)
- **Sitio Web Desplegado:** [https://eduportaluv.netlify.app/](https://eduportaluv.netlify.app/)
- **Backend API:** [https://proyecto-escolar-backend.onrender.com](https://proyecto-escolar-backend.onrender.com)

---

## Descripción del Proyecto
El sistema proporciona dos interfaces principales:
1.  **Panel Administrativo:** Gestión integral de alumnos, docentes, materias, turnos y asignaciones.
2.  **Panel Docente:** Herramientas para registrar calificaciones, asistencia y gestionar recursos.

La aplicación consume una API REST en Java y gestiona el estado de la aplicación de forma centralizada para evitar recargas innecesarias de página.

---

## Tecnologías
* **Framework:** React 18
* **Build Tool:** Vite
* **Estilos:** CSS3 / Módulos CSS
* **Consumo de API:** Fetch API
* **Despliegue:** Netlify

---

## 👥 Equipo de Desarrollo

| Desarrollador | Funcionalidades Frontend |
| :--- | :--- |
| **Gutiérrez Contreras Yael Adair** | Integración de datos (Tablas Alumnos, Turnos, Asignaciones), corrección de visualización (camelCase). |
| **Guzmán Zavaleta José Ángel** | Menú principal y Vistas de administración. |
| **Herrera González Carolina** | Login, Roles de usuario y Estructura base. |
| **Saldaña Marlene** | Módulos de Inscripción, Calificaciones y Asistencia. |
| **Suarez Salamanca Jonathan** | Vistas de Materias. |

---

## Ejecución en Local

### Prerrequisitos
* Node.js y npm instalados.

### Pasos
1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/YaelAdair11/proyecto_escolar_frontend.git](https://github.com/YaelAdair11/proyecto_escolar_frontend.git)
    cd proyecto_escolar_frontend
    ```

2.  **Instalar Dependencias:**
    Descarga todas las librerías necesarias ejecutando:
    ```bash
    npm install
    ```

3.  **Ejecutar en modo Desarrollo:**
    Para ver la aplicación y editar código en tiempo real:
    ```bash
    npm run dev
    ```
    *La app estará disponible en `http://localhost:5173`*

4.  **Compilación Local (Opcional):**
    Para generar la carpeta `dist` lista para producción:
    ```bash
    npm run build
    ```

---

## Despliegue en la Nube (Netlify)

Pasos para publicar la aplicación en Internet usando Netlify:

1.  Ingresa a [Netlify](https://www.netlify.com/) y selecciona **"Add new site"** -> **"Import an existing project"**.
2.  Conecta con **GitHub**.
3.  Selecciona el repositorio: `proyecto_escolar_frontend`.
4.  **Configuración de Despliegue (Build Settings):**
    * **Branch to deploy:** `main`
    * **Build command:** `npm run build` (Requerido para Vite)
    * **Publish directory:** `dist` (Directorio de salida de Vite)
5.  Clic en **Deploy site**.
6.  Netlify ejecutará el comando, creará la carpeta `dist` y publicará tu sitio automáticamente.
