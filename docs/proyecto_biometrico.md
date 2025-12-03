# Sistema de Asistencia por Reconocimiento Facial

## 1. Descripcion del problema
Registrar asistencia de forma automatica y segura evitando firmas manuales y suplantacion. El sistema usa reconocimiento facial en tiempo real para identificar al empleado y marcar entrada/salida.

## 2. Justificacion
- Automatiza el control de asistencia y reduce tareas repetitivas.
- Minimiza errores humanos y fraudes (marcar por otro).
- Mejora experiencia: basta mirar a la camara; se valida horario, zona y dispositivo.
- Ofrece trazabilidad (horario, geolocalizacion y logs de eventos).

## 3. Objetivos (segun implementacion actual)
- Registrar entradas/salidas con embeddings faciales generados en el navegador (face-api.js) y validados en backend.
- Administrar empleados, roles, horarios, zonas/sucursales y dispositivos desde un panel React.
- Persistir asistencia de forma transaccional en Supabase (RPC `fn_registrar_asistencia` con validacion de horario/tolerancia y concurrencia).
- Exponer logs y estados (presente/retraso) y habilitar incidencias para retrasos.

## 4. Delimitacion
- Ambito: entorno controlado (empresa/aula/laboratorio) con camara web y navegador moderno.
- Datos: se guardan embeddings y URLs de fotos en Supabase Storage; no se consumen datasets externos.
- Funcionamiento online: backend en Render + Supabase (DB/Storage) como dependencia.

## 5. Relevancia del uso de IA
- Face-api.js (CNN preentrenada) genera embeddings en cliente.
- Comparacion por similitud coseno con umbrales dinamicos y margen adaptable para decidir identidad y confianza.
- Verificacion multi-captura para mayor robustez.

## 6. Herramientas usadas en este proyecto
- Lenguajes: JavaScript/Node.js (backend) y JavaScript/React (frontend).
- Backend: Express; Supabase JS (PostgreSQL + Storage); Multer para fotos; JWT (roles admin/usuario); funciones RPC (`fn_registrar_asistencia`, `fn_registrar_empleado`) y SQL transaccional con indices unicos para concurrencia.
- Frontend: React + Vite; face-api.js para embeddings en navegador; UI de verificacion facial (multi-muestras, score/confianza); panel admin (empleados, horarios, zonas, logs, perfil).
- Infra/Datos: Supabase (DB, RPC, Storage), Render (backend); geocerca y sucursales en Supabase; CORS y fetch/REST para integracion.
- Entorno: VS Code, npm/pnpm para dependencias.

## 7. Arquitectura implementada
- **Backend (Node.js + Express):**
  - Rutas: auth (login JWT), empleados (CRUD + foto), horarios (CRUD), asistencia (RPC transaccional), plantillas/identificacion facial, zonas/sucursales, logs.
  - Supabase: PostgreSQL para datos, Storage para fotos; RPC para operaciones atomicas de asistencia y registro de empleado; indices unicos para horario/asistencia.
  - Middlewares: JWT (requireAuth/requireAdmin), Multer (upload), CORS.
- **Frontend (React/Vite):**
  - Verificacion: captura webcam, genera embeddings en cliente, envia a `/plantillas/identificar` con timestamp, zona y debug opcional.
  - Panel admin: gestion de empleados (ver/editar/eliminar), horarios, zonas (geocerca), logs, sucursales y perfil.
  - UI: componentes propios (`NativeSelect`, animaciones de texto), estados de retraso/incidencia, feedback de confianza/score.
- **Base de datos y transacciones:**
  - Tablas: empleado, horario, asistencia, plantilla_facial, usuario, rol, zonas/sucursales.
  - Indices unicos: horario(id_empleado, dia_semana); asistencia(id_empleado, fecha, numero_turno).
  - Funcion `fn_registrar_asistencia`: valida horario, aplica tolerancia, determina estado (presente/retraso), maneja entrada/salida con SELECT FOR UPDATE y mapea errores a 403/404/409.

## 8. Consideraciones de seguridad y etica
- Privacidad biometrica: trabajar con embeddings y URLs de fotos; limitar acceso a Storage/DB por rol.
- Control de acceso: JWT y roles para operaciones sensibles (empleados, horarios, asistencia).
- Transparencia: informar a los usuarios sobre la recoleccion y uso de datos faciales dentro del ambito delimitado; usar geocerca solo en el contexto autorizado.
