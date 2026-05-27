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

## Configuración de Base de Datos y Modo Simulador
Este proyecto cuenta con una arquitectura híbrida de base de datos diseñada para evitar bloqueos en el desarrollo del equipo.

Si el entorno no detecta una base de datos PostgreSQL activa con el nombre sos_mascotas o las credenciales fallan, el sistema no se interrumpirá. En su lugar, el backend activará automáticamente un MODO SIMULADOR utilizando datos dinámicos temporales en memoria (Mocks).

 Pasos para la conexión real (PostgreSQL Local):
Asegurarse de tener configurado el archivo .env en la raíz de la carpeta backend.

Si se tienen múltiples instalaciones de PostgreSQL en Windows, verificar el puerto real del motor. En caso de conflicto de puertos, sintonizar el archivo .env apuntando a:
DB_PORT=5433 (o el puerto configurado en su pgAdmin).

Una vez creada la base de datos sos_mascotas y sus tablas correspondientes en el motor local, el backend desactivará el simulador y migrará el flujo de datos a la base real de forma totalmente automática en el próximo reinicio.

## Endpoints Listos para Testear (Modo Simulador / Real):
Mascotas (Muro): GET y POST a http://localhost:3000/api/mascotas

Usuarios (Login): POST a http://localhost:3000/api/usuarios/login

Usuarios (Registro): POST a http://localhost:3000/api/usuarios/registrar

Nota: Para pruebas dinámicas en Modo Simulador, se puede utilizar el usuario de prueba juan@correo.com con la contraseña 123456 directamente en Postman.