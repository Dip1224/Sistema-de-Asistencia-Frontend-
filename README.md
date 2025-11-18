# Sistema de Reconocimiento

Repositorio base para crear el frontend y backend de un sistema de reconocimiento facial.

## Estructura general

```
SISTEMA DE RECONOCIMIENTO/
+-- backend/
|   +-- package.json
|   +-- .env.example
|   +-- src/
|       +-- server.js
|       +-- config/
|       |   +-- index.js
|       |   +-- supabaseClient.js
|       +-- controllers/
|       |   +-- recognition.controller.js
|       +-- routes/
|       |   +-- recognition.routes.js
|       +-- services/
|       |   +-- recognition.service.js
|       |   +-- supabase.service.js
|       +-- middleware/
|           +-- errorHandler.js
+-- frontend/
    +-- index.html
    +-- package.json
    +-- vite.config.js
    +-- src/
        +-- main.js
        +-- services/
        |   +-- api.js
        +-- components/
        |   +-- uploadForm.js
        |   +-- resultPanel.js
        +-- styles/
            +-- main.css
```

## Backend

1. Entra en `backend/` e instala dependencias: `npm install`.
2. Copia `.env.example` a `.env` y ajusta los valores.
3. Ejecuta `npm run dev` para iniciar la API con reinicio automatico.

### Endpoints expuestos

- `GET /api/health` comprueba el estado del servicio.
- `GET /api/recognition/models` lista los modelos disponibles.
- `POST /api/recognition/analyze` recibe una imagen en base64 y devuelve el analisis.

### Variables de entorno para Railway + Supabase

El archivo `backend/.env.example` incluye todo lo necesario. Los campos clave son:

- `CORS_ORIGIN`: lista separada por comas con los origenes que pueden consumir la API (ejemplo: `http://localhost:5173,https://tu-app.up.railway.app`).
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: obligatorios para conectar el backend desplegado en Railway con la base de datos Supabase.
- `SUPABASE_PEOPLE_TABLE`: tabla en Supabase con las personas registradas. Debe tener un campo definido en `SUPABASE_REFERENCE_FIELD` con el hash SHA-256 de la foto de referencia.
- `SUPABASE_FACES_BUCKET` y `SUPABASE_IMAGE_FIELD`: usa estos campos si guardas las fotos en Supabase Storage. Cuando no exista el hash en la tabla, el servicio descargara la imagen desde Storage y generara el hash automaticamente.
- `SUPABASE_MATCH_THRESHOLD`: numero entre 0 y 1 que indica la similitud minima para verificar una persona (por defecto 0.90).

Con esa configuracion el modelo `supabase-hash` decodifica la imagen recibida, calcula su hash SHA-256 y lo compara con cada persona en Supabase. Si la similitud supera el umbral configurado se marca como verificada y se devuelve la informacion de la persona encontrada. El modelo `fast-sim` permanece disponible para pruebas locales sin necesidad de conectarse a Supabase.

## Frontend

1. Entra en `frontend/` e instala dependencias: `npm install`.
2. Ejecuta `npm run dev` para levantar Vite en `http://localhost:5173`.
3. Ajusta `src/services/api.js` si despliegas el backend en otra URL (por ejemplo en Railway).

El formulario permite subir una imagen, elegir un modelo y mostrar la respuesta recibida del backend.

## Siguientes pasos recomendados

- Sustituir la comparacion por hash por un modelo real de reconocimiento facial.
- Agregar autenticacion y controles de acceso si el sistema se expone publicamente.
- Anadir pruebas automatizadas y monitoreo para el backend desplegado en Railway.
