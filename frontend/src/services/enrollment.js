import { getFaceModel } from "../lib/faceModel.js";
import { fileToImage } from "../utils/imageHelpers.js";
import API_BASE_URL from "../config/api.js";

export async function enrollEmployeeFace({ empleado, file, rutaImagen }) {
  if (!empleado?.id_empleado || !file) {
    throw new Error("Empleado o archivo no validos para registrar plantilla");
  }

  console.info("[enrollEmployeeFace] Iniciando registro facial", {
    id_empleado: empleado.id_empleado,
    nombre: empleado.nombre,
    tieneArchivo: Boolean(file)
  });

  const modelo = await getFaceModel();
  const imagen = await fileToImage(file);

  const dimensiones = {
    width: imagen?.naturalWidth || imagen?.width || null,
    height: imagen?.naturalHeight || imagen?.height || null
  };

  console.info("[enrollEmployeeFace] Imagen cargada", dimensiones);

  const detecciones = await modelo.detect(imagen);
  const scores = Array.isArray(detecciones)
    ? detecciones.map(det => det?.detection?.score ?? null)
    : [];

  console.info("[enrollEmployeeFace] Resultado deteccion", {
    totalDetecciones: detecciones?.length ?? 0,
    scores
  });

  if (!detecciones || !detecciones.length) {
    throw new Error("No se detecto rostro en la imagen proporcionada");
  }

  const embeddingTensor = await modelo.embed(detecciones[0]);
  const embedding = Array.from(embeddingTensor);

  console.info("[enrollEmployeeFace] Embedding generado", {
    dimension: embedding.length
  });

  const respuesta = await fetch(`${API_BASE_URL}/plantillas/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_empleado: empleado.id_empleado,
      ruta_imagen:
        rutaImagen || empleado.foto || empleado.foto_url || empleado.ruta_imagen || empleado.imagen || null,
      embedding
    })
  });

  const payload = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(payload?.error || "No se pudo registrar la plantilla facial");
  }

  return payload?.plantilla || null;
}

export async function registrarPlantillaFacial(empleado, file, rutaImagen) {
  return enrollEmployeeFace({ empleado, file, rutaImagen });
}
