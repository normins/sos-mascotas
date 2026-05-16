# Documentación de la API - SOS Mascotas 🐾

Este repositorio contiene el Backend del proyecto **SOS Mascotas**, desarrollado por el equipo **ÉpicaSoft** para la Práctica Profesionalizante de la Tecnicatura Superior en Desarrollo de Software.

##  Descripción del Proyecto
SOS Mascotas es una plataforma integral diseñada para gestionar rescates, tránsitos y adopciones de animales. Este backend actúa como el núcleo de lógica de negocio, conectando la base de datos PostgreSQL con la interfaz de usuario adaptable.

##  Tecnologías Utilizadas
* **Node.js**: Entorno de ejecución para JavaScript.
* **Express**: Framework para la creación de la API REST.
* **Nodemon**: Herramienta de desarrollo para reinicio automático del servidor.

##  Estructura del Proyecto (MVC)
La arquitectura sigue el patrón Modelo-Vista-Controlador para asegurar el orden y la escalabilidad del código.

```text
backend/
├── src/
│   ├── controllers/    # Lógica de las funciones (Mascotas, Usuarios)
│   ├── routes/         # Definición de los endpoints
│   └── app.js          # Punto de entrada del servidor
├── .gitignore          # Archivos excluidos de Git
└── package.json        # Dependencias y scripts
```

### Módulo de Usuarios
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| POST | `/api/usuarios/registro` | Registra un nuevo usuario (Adoptante/Administrador). |

### Módulo de Mascotas
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| GET | `/api/mascotas` | Obtiene la lista completa de mascotas para el muro. |
| POST | `/api/mascotas` | Permite cargar una nueva mascota al sistema. |

## Instalación y Uso Local

1. **Clonar el repositorio:** `git clone [URL-del-repo]`
2. **Navegar a la carpeta backend:** `cd backend`
3. **Instalar dependencias:** `npm install`
4. **Iniciar el servidor:** `npm run dev` (usando nodemon) o `node src/app.js`