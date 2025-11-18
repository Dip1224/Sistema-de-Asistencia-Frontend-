const MODEL_BASE_PATH = "/models/faceapi";

let loadPromise = null;
let modelInstance = null;

function waitForFaceApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("El modelo facial requiere un navegador"));
  }
  if (window.faceapi) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    function handleReady() {
      cleanup();
      if (window.faceapi) {
        resolve();
      } else {
        reject(new Error("face-api no quedo disponible tras cargar el script"));
      }
    }

    function handleError(event) {
      cleanup();
      const detail = event?.detail ? ` (${event.detail})` : "";
      reject(new Error(`No se pudo cargar face-api${detail}`));
    }

    function cleanup() {
      window.removeEventListener("faceapi:ready", handleReady);
      window.removeEventListener("faceapi:error", handleError);
    }

    window.addEventListener("faceapi:ready", handleReady, { once: true });
    window.addEventListener("faceapi:error", handleError, { once: true });
  });
}

async function ensureFaceApiModels() {
  if (!window.faceapi) {
    throw new Error("face-api no esta disponible en la ventana");
  }

  if (!loadPromise) {
    loadPromise = Promise.all([
      window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE_PATH),
      window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE_PATH),
      window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE_PATH)
    ]);
  }

  await loadPromise;
}

class FaceApiModel {
  constructor() {
    this.detectorOptions = new window.faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.4
    });
  }

  async detect(source) {
    const multipleDetections = await window.faceapi
      .detectAllFaces(source, this.detectorOptions)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (multipleDetections.length) {
      const best = multipleDetections.reduce((prev, curr) => {
        const prevScore = prev?.detection?.score ?? 0;
        const currScore = curr?.detection?.score ?? 0;
        return currScore > prevScore ? curr : prev;
      });

      return best ? [best] : [];
    }

    const detection = await window.faceapi
      .detectSingleFace(source, this.detectorOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return [];
    return [detection];
  }

  async embed(faceOrSource) {
    if (faceOrSource?.descriptor instanceof Float32Array) {
      return Array.from(faceOrSource.descriptor);
    }

    const detecciones = await this.detect(faceOrSource);
    if (!detecciones.length) {
      throw new Error("No se detecto ningun rostro para generar embedding");
    }

    return Array.from(detecciones[0].descriptor);
  }
}

export async function getFaceModel() {
  await waitForFaceApi();
  await ensureFaceApiModels();

  if (!modelInstance) {
    modelInstance = new FaceApiModel();
  }

  return modelInstance;
}
