import { useEffect, useRef, useState } from "react";
import { enrollEmployeeFace } from "../services/enrollment.js";
import { acquireSharedCamera, releaseSharedCamera, buildCameraConstraints } from "../lib/sharedCamera.js";
import API_BASE_URL from "../config/api.js";
import { fetchRoles } from "../services/roles.js";

const CAMERA_OPTIONS = [
  { value: "front", label: "Camara frontal / selfie" },
  { value: "back", label: "Camara trasera" }
];

function TestEmployeeUpload() {
  const [ci, setCi] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cargo, setCargo] = useState("");
  const [idDepartamento, setIdDepartamento] = useState("1");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [idRol, setIdRol] = useState("");
  const [username, setUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraBusy, setIsCameraBusy] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState("");
  const [cameraFacing, setCameraFacing] = useState("front");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    startCamera();
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isCameraActive && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play?.().catch(() => {});
    } else {
      videoRef.current.srcObject = null;
    }
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      if (capturedPreview) {
        URL.revokeObjectURL(capturedPreview);
      }
    };
  }, [capturedPreview]);

  useEffect(() => {
    async function loadRoles() {
      try {
        setLoadingRoles(true);
        const list = await fetchRoles();
        setRoles(list.filter(r => r.id_rol));
        if (list.length && !idRol) {
          setIdRol(String(list[0].id_rol));
        }
      } catch (err) {
        console.error("No se pudieron cargar los roles", err);
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    }
    loadRoles();
  }, [idRol]);

  function stopCamera() {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      releaseSharedCamera();
      streamRef.current = null;
    }
    if (mountedRef.current) {
      setIsCameraActive(false);
      setIsCameraBusy(false);
    }
  }

  async function startCamera(requestedFacing) {
    if (!mountedRef.current || isCameraBusy) return;
    const desiredFacing = requestedFacing || cameraFacing;

    try {
      setIsCameraBusy(true);
      setCameraError("");
      setIsCameraActive(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        releaseSharedCamera();
        streamRef.current = null;
      }

      const stream = await acquireSharedCamera(
        buildCameraConstraints({ facing: desiredFacing })
      );

      if (!mountedRef.current) {
        releaseSharedCamera();
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        if (typeof videoRef.current.play === "function") {
          await videoRef.current.play().catch(() => {});
        }
      }

      if (mountedRef.current) {
        setCameraFacing(desiredFacing);
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("No se pudo iniciar la camara", err);
      if (mountedRef.current) {
        setCameraError(err?.message || "No se pudo iniciar la camara.");
      }
    } finally {
      if (mountedRef.current) {
        setIsCameraBusy(false);
      }
    }
  }

  function handleCameraFacingChange(event) {
    if (!mountedRef.current) return;
    const nextFacing = event.target.value;
    setCameraFacing(nextFacing);
    if (isCameraBusy) {
      return;
    }
    if (isCameraActive || streamRef.current) {
      startCamera(nextFacing);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
      setCapturedPreview("");
    }

    setFotoFile(file);
    setStatus("");
    setErrorMsg("");
    setCameraError("");

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCapturedPreview(previewUrl);
    }
  }

  function discardCapture() {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedPreview("");
    setFotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDiscardClick() {
    discardCapture();
    setStatus("");
    setErrorMsg("");
    setCameraError("");
  }

  function capturePhoto() {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) {
      setCameraError("Primero debes iniciar la camara.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("No se pudo acceder al lienzo para capturar la imagen.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      blob => {
        if (!blob) {
          setCameraError("No se pudo capturar la foto. Intenta nuevamente.");
          return;
        }

        const file = new File([blob], `captura-${Date.now()}.jpg`, { type: "image/jpeg" });
        if (capturedPreview) {
          URL.revokeObjectURL(capturedPreview);
        }
        const previewUrl = URL.createObjectURL(blob);

        setCapturedPreview(previewUrl);
        setFotoFile(file);
        setStatus("Foto tomada desde la camara. Ya puedes registrar al empleado.");
        setErrorMsg("");
        setCameraError("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      "image/jpeg",
      0.92
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setErrorMsg("");

    if (!fotoFile) {
      setErrorMsg("Debes seleccionar una foto o tomarla con la camara.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ci", ci);
      formData.append("nombre", nombre);
      formData.append("apellido", apellido);
      formData.append("cargo", cargo);
      formData.append("username", username);
      formData.append("password", userPassword);
      if (idRol) {
        formData.append("id_rol", idRol);
      }
      formData.append("id_departamento", idDepartamento);
      formData.append("fecha_ingreso", fechaIngreso);
      formData.append("foto", fotoFile);

      const respuesta = await fetch(`${API_BASE_URL}/empleados/registrar`, {
        method: "POST",
        body: formData
      });

      const payload = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(payload?.error || payload?.message || "Error registrando empleado");
      }

      const empleadoRespuesta = Array.isArray(payload?.empleado) ? payload.empleado[0] : payload?.empleado;
      if (!empleadoRespuesta?.id_empleado) {
        throw new Error("La respuesta del servidor no incluyó el ID del empleado.");
      }

      const rutaImagen =
        empleadoRespuesta?.foto ||
        empleadoRespuesta?.ruta_imagen ||
        empleadoRespuesta?.foto_url ||
        payload?.foto_url ||
        null;

      setStatus(
        `Empleado registrado: ${empleadoRespuesta?.nombre ?? ""} ${empleadoRespuesta?.apellido ?? ""} (ID ${
          empleadoRespuesta?.id_empleado ?? "?"
        })`
      );

      try {
        const plantilla = await enrollEmployeeFace({
          empleado: empleadoRespuesta,
          file: fotoFile,
          rutaImagen
        });

        if (!plantilla) {
          setErrorMsg("Empleado registrado, pero falló el registro de la plantilla facial. Revisa la consola para más detalles.");
          return;
        }

        if (plantilla.id_plantilla) {
          setStatus(prev => `${prev}. Plantilla facial guardada (ID ${plantilla.id_plantilla}).`);
        } else {
          setStatus(prev => `${prev}. Plantilla facial guardada.`);
        }
      } catch (err) {
        console.error("Error creando plantilla facial:", err);
        setErrorMsg(`Empleado registrado, pero fallo el registro de plantilla: ${err.message}`);
      }

      setCi("");
      setNombre("");
      setApellido("");
      setCargo("");
      setUsername("");
      setUserPassword("");
      setIdDepartamento("1");
      setFechaIngreso("");
      discardCapture();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error interno al registrar empleado");
    }
  }

  const isFrontCamera = cameraFacing === "front";

  return (
    <section className="test-upload">
      <h2>Registrar empleado + plantilla facial</h2>
      <form className="simple-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="CI" value={ci} onChange={e => setCi(e.target.value)} required />
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={e => setApellido(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cargo"
          value={cargo}
          onChange={e => setCargo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Usuario para el panel"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contrasena para el panel"
          value={userPassword}
          onChange={e => setUserPassword(e.target.value)}
          required
        />
        <label>
          Rol
          <select value={idRol} onChange={e => setIdRol(e.target.value)} disabled={loadingRoles}>
            <option value="">{loadingRoles ? "Cargando roles..." : "Selecciona un rol"}</option>
            {roles.map(role => (
              <option key={role.id_rol} value={role.id_rol}>
                {role.id_rol} - {role.nombre}
              </option>
            ))}
          </select>
        </label>
        <input
          type="number"
          min="1"
          placeholder="ID Departamento"
          value={idDepartamento}
          onChange={e => setIdDepartamento(e.target.value)}
          required
        />
        <input
          type="date"
          value={fechaIngreso}
          onChange={e => setFechaIngreso(e.target.value)}
          required
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isCameraBusy}
        />

        <div className="camera-tools">
          <div className="camera-settings">
            <label>
              Camara
              <select value={cameraFacing} onChange={handleCameraFacingChange} disabled={isCameraBusy}>
                {CAMERA_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="camera-actions">
            <button type="button" onClick={() => startCamera()} disabled={isCameraBusy || isCameraActive}>
              Iniciar camara
            </button>
            <button type="button" onClick={capturePhoto} disabled={!isCameraActive}>
              Tomar foto
            </button>
            <button type="button" onClick={handleDiscardClick} disabled={!capturedPreview && !fotoFile}>
              Limpiar foto
            </button>
          </div>

          {cameraError && <p className="camera-error">{cameraError}</p>}

          {isCameraActive && (
            <div className="camera-preview">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={isFrontCamera ? { transform: "scaleX(-1)" } : undefined}
              />
            </div>
          )}

          <canvas ref={canvasRef} className="camera-canvas" />

          {capturedPreview && (
            <div className="camera-captured">
              <img src={capturedPreview} alt="Foto seleccionada" />
              <span>Esta imagen se enviara al registrar al empleado.</span>
            </div>
          )}
        </div>

        <button type="submit">Registrar empleado y plantilla</button>
      </form>

      {status && <p className="status success">{status}</p>}
      {errorMsg && <p className="status error">{errorMsg}</p>}
    </section>
  );
}

export default TestEmployeeUpload;
