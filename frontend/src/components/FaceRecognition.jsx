import { useEffect, useRef, useState } from "react";
import { getFaceModel } from "../lib/faceModel.js";
import { acquireSharedCamera, releaseSharedCamera, buildCameraConstraints } from "../lib/sharedCamera.js";
import API_BASE_URL from "../config/api.js";
import { fetchBranches } from "../services/branches.js";
import { NativeSelect, NativeSelectOption } from "./ui/native-select.jsx";
const SAMPLE_COUNT = 3;
const SAMPLE_DELAY_MS = 200;
const IDENTIFICATION_ROUNDS = 2;

const CAMERA_OPTIONS = [
  { value: "front", label: "Camara frontal / selfie" },
  { value: "back", label: "Camara trasera" }
];

function FaceRecognition() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(false);
  const [status, setStatus] = useState("Inicializando camara...");
  const [loading, setLoading] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraFacing, setCameraFacing] = useState("front");
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [geoChecking, setGeoChecking] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    async function bootstrap() {
      try {
        const list = await fetchBranches().catch(() => []);
        if (!mountedRef.current) return;
        setBranches(list);
        if (list.length === 1) {
          setSelectedBranchId(list[0].id);
        }
        await startCamera("front");
        if (!mountedRef.current) return;
        setStatus("Camara lista. Cargando modelo biometrico...");
        await getFaceModel();
        if (!mountedRef.current) return;
        setStatus("Modelo facial listo. Presiona Identificar para marcar asistencia.");
      } catch (err) {
        console.error(err);
        if (mountedRef.current) {
          setStatus(err?.message || "No se pudo acceder a la camara o cargar el modelo.");
        }
      }
    }

    bootstrap();

    return () => {
      mountedRef.current = false;
      detachStream();
    };
  }, []);

  function detachStream() {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      releaseSharedCamera();
      streamRef.current = null;
    }
  }

  async function startCamera(desiredFacing) {
    if (!mountedRef.current) return null;
    const nextFacing = desiredFacing || cameraFacing;
    setCameraBusy(true);
    setCameraError("");
    detachStream();

    try {
      const constraints = buildCameraConstraints({ facing: nextFacing });
      const stream = await acquireSharedCamera(constraints);
      if (!mountedRef.current) {
        releaseSharedCamera();
        return null;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        if (typeof videoRef.current.play === "function") {
          await videoRef.current.play().catch(() => {});
        }
      }
      setCameraFacing(nextFacing);
      return stream;
    } catch (err) {
      if (mountedRef.current) {
        setCameraError(err?.message || "No se pudo acceder a la camara.");
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setCameraBusy(false);
      }
    }
  }

  async function handleFacingChange(event) {
    if (!mountedRef.current) return;
    const nextFacing = event.target.value;
    if (nextFacing === cameraFacing && streamRef.current) {
      return;
    }

    try {
      await startCamera(nextFacing);
      setStatus("Camara lista. Presiona Identificar para continuar.");
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "No se pudo cambiar la camara.");
    }
  }

  function capturarFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function promediarEmbeddings(embeddings) {
    if (!embeddings.length) return null;
    const length = embeddings[0].length;
    const acumulado = new Array(length).fill(0);
    embeddings.forEach(vector => {
      if (!vector || vector.length !== length) return;
      for (let i = 0; i < length; i += 1) {
        acumulado[i] += vector[i];
      }
    });
    return acumulado.map(valor => valor / embeddings.length);
  }

  async function capturarEmbeddingPromedio(modelo, rondaActual) {
    const embeddings = [];

    for (let i = 0; i < SAMPLE_COUNT; i += 1) {
      setStatus(
        `Ronda ${rondaActual + 1}/${IDENTIFICATION_ROUNDS}: Capturando muestra ${i + 1} de ${SAMPLE_COUNT}...`
      );
      const canvas = capturarFrame();
      if (!canvas) break;
      const detecciones = await modelo.detect(canvas);
      if (detecciones && detecciones.length) {
        const embeddingTensor = await modelo.embed(detecciones[0]);
        embeddings.push(Array.from(embeddingTensor));
        setStatus(
          `Ronda ${rondaActual + 1}: muestra ${i + 1} lista (score ${
            detecciones[0].detection?.score?.toFixed?.(3) ?? "N/A"
          }).`
        );
      } else {
        setStatus(`Ronda ${rondaActual + 1}: no se detecto rostro en la muestra ${i + 1}.`);
      }
      await sleep(SAMPLE_DELAY_MS);
    }

    if (!embeddings.length) {
      return null;
    }

    return promediarEmbeddings(embeddings);
  }

  async function identificar() {
    try {
      setLoading(true);
      setStatus("Verificando ubicacion...");
      const geoOk = await verificarGeocerca();
      if (!geoOk) {
        setLoading(false);
        return;
      }

      setStatus("Preparando captura...");
      const model = await getFaceModel();
      const payloadEmbeddings = [];

      for (let ronda = 0; ronda < IDENTIFICATION_ROUNDS; ronda += 1) {
        const embeddingPromedio = await capturarEmbeddingPromedio(model, ronda);
        if (!embeddingPromedio) {
          setStatus(`No se pudo generar el embedding en la ronda ${ronda + 1}. Intenta nuevamente.`);
          return;
        }
        payloadEmbeddings.push(embeddingPromedio);
        if (ronda < IDENTIFICATION_ROUNDS - 1) {
          setStatus("Preparando siguiente captura...");
          await sleep(300);
        }
      }

      setStatus("Enviando embeddings al backend...");
      const respuesta = await fetch(`${API_BASE_URL}/plantillas/identificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeddings: payloadEmbeddings,
          id_dispositivo: 1,
          debug: true,
          muestrasPorRonda: SAMPLE_COUNT
        })
      });

      const data = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        let mensaje = data.error || "Empleado no reconocido";
        if (data.confidence) {
          mensaje += ` (confianza ${data.confidence})`;
        }
        if (data?.coincidencias?.length) {
          mensaje += `\nCoincidencias: ${data.coincidencias
            .map(c => `ID ${c.id_empleado} (${(c.score ?? 0).toFixed(3)})`)
            .join(", ")}`;
        }
        setStatus(mensaje);
        return;
      }

      if (data.identificado) {
        const confidenceLabel = data.confidence ? ` [confianza ${data.confidence}]` : "";
        let mensaje = `Empleado ${data.empleado?.nombre || ""} ${
          data.empleado?.apellido || ""
        } - Accion: ${data.accion?.toUpperCase() || "N/A"} (score ${
          data.score?.toFixed?.(3) ?? data.score
        })${confidenceLabel}`;
        if (data?.coincidencias?.length) {
          mensaje += `\nCoincidencias: ${data.coincidencias
            .map(c => `ID ${c.id_empleado} (${(c.score ?? 0).toFixed(3)})`)
            .join(", ")}`;
        }
        setStatus(mensaje);
      } else {
        setStatus("No identificado");
      }
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Error identificando empleado");
    } finally {
      setLoading(false);
    }
  }

  async function verificarGeocerca() {
    if (!selectedBranchId) {
      setStatus("Selecciona una sucursal antes de verificar.");
      return false;
    }

    if (!navigator?.geolocation) {
      setStatus("Geolocalizacion no disponible en este navegador.");
      return false;
    }

    setGeoChecking(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(`${API_BASE_URL}/api/checkins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: Number(latitude),
          lng: Number(longitude),
          branch_id: selectedBranchId
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(data?.error || "No se pudo validar la geocerca.");
        return false;
      }

      if (!data.inside) {
        setStatus("No es posible realizar la verificacion: estas fuera de la zona permitida.");
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "No se pudo validar la geocerca.");
      return false;
    } finally {
      setGeoChecking(false);
    }
  }

  const isFrontCamera = cameraFacing === "front";
  return (
    <div className="recognition-panel">
      <div className="recognition-video">
        <div className="camera-toolbar">
          <NativeSelect
            id="branchSelect"
            label="Sucursal"
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            disabled={geoChecking || loading || cameraBusy}
          >
            <NativeSelectOption value="">Selecciona una sucursal</NativeSelectOption>
            {branches.map(branch => (
              <NativeSelectOption key={branch.id} value={branch.id}>
                {branch.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect
            id="cameraFacing"
            label="Camara"
            value={cameraFacing}
            onChange={handleFacingChange}
            disabled={cameraBusy || loading}
          >
            {CAMERA_OPTIONS.map(option => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={isFrontCamera ? { transform: "scaleX(-1)" } : undefined}
        />
      </div>

      {cameraError && <p className="camera-error">{cameraError}</p>}

      <button type="button" onClick={identificar} disabled={loading || cameraBusy || geoChecking}>
        {loading || geoChecking ? "Procesando..." : "Identificar"}
      </button>

      <pre className="recognition-status">{status}</pre>
    </div>
  );
}

export default FaceRecognition;
