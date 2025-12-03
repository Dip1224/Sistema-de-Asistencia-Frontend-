import { useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import TestEmployeeUpload from "./components/TestEmployeeUpload.jsx";
import FaceRecognition from "./components/FaceRecognition.jsx";
import ScheduleManager from "./components/ScheduleManager.jsx";
import API_BASE_URL from "./config/api.js";
import HeroVideoDialog from "./components/HeroVideoDialog.jsx";
import AnimatedThemeToggler from "./components/AnimatedThemeToggler.jsx";
import SmoothCursor from "./components/SmoothCursor.jsx";
import { fetchZone, saveZone } from "./services/zone.js";
import { fetchBranches, createBranch, deleteBranch } from "./services/branches.js";
import MapPicker from "./components/MapPicker.jsx";
import EmployeeSchedule from "./components/EmployeeSchedule.jsx";
import EmployeeLogs from "./components/EmployeeLogs.jsx";
import VerifyIntro from "./components/VerifyIntro.jsx";
import LayoutTextFlip from "./components/ui/layout-text-flip.jsx";
import TypewriterTitle from "./components/ui/typewriter-title.jsx";
import ProfileCard from "./components/ProfileCard.jsx";
import EmployeesManager from "./components/EmployeesManager.jsx";

const AUTH_STORAGE_KEY = "sr_auth_info";

function decodeTokenExpirationMs(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(atob(parts[1]));
    if (!payload?.exp) return null;
    return payload.exp * 1000;
  } catch (err) {
    console.error("No se pudo decodificar el token", err);
    return null;
  }
}

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("No se pudo leer la sesion guardada", err);
    return null;
  }
}

function persistAuth(auth) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch (err) {
    console.error("No se pudo guardar la sesion", err);
  }
}

function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.error("No se pudo limpiar la sesion", err);
  }
}

function isAdminRole(auth) {
  if (!auth) return false;
  const roleName = auth.rol_nombre?.toLowerCase?.() || "";
  const roleId = Number(auth.id_rol);
  return roleName.includes("admin") || roleId === 1;
}

function HomePage({ onEnterApp, onLogin, onGoHome }) {
  return (
    <div className="home-shell">
      <header className="app-nav floating">
        <nav className="nav-menu open">
          <button type="button" className="menu-option active" onClick={onGoHome || onEnterApp}>
            Inicio
          </button>
        </nav>
        <div className="nav-actions">
          <AnimatedThemeToggler className="theme-toggle" aria-label="Cambiar tema" />
          <button type="button" className="primary-btn" onClick={onLogin}>
            Iniciar sesion
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="home-screen">
          <div className="home-hero">
            <div className="hero-copy">
              <p className="eyebrow">Control de asistencia con biometria facial</p>
              <h1 className="hero-title">
                <span className="typing-static">Bienvenido al panel</span>
                <TypewriterTitle
                  sequences={[
                    { text: "Sistema de Reconocimiento", deleteAfter: true },
                    { text: "Marca tu entrada en segundos", deleteAfter: true },
                    { text: "Marca tu salida sin esperas", deleteAfter: true }
                  ]}
                />
              </h1>
              <p className="hero-lead">
                Registra empleados, captura plantillas faciales, gestiona horarios y aplica geolocalizacion para las
                marcaciones. Usa el menu para acceder rapido a cada modulo.
              </p>
              <div className="hero-actions">
                <button type="button" className="primary" onClick={onEnterApp}>
                  Verificar asistencia
                </button>
              </div>
            </div>
          </div>

          <div className="home-video">
            <h3>AsÃ­ funciona</h3>
            <p>Reproduce un breve video de la experiencia de registro y verificaciÃ³n.</p>
            <HeroVideoDialog
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/bIVIEZNsa_I?si=bMn8WHcfcplVEpR6"
              thumbnailSrc="/portada.png"
              darkThumbnailSrc="/portada.png"
              thumbnailAlt="Demo de reconocimiento"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function LoginPage({ onSubmit, credentials, setCredentials, loginError, loginLoading }) {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-hero">
          <p className="eyebrow">Panel seguro</p>
          <h1>Accede para administrar asistencia</h1>
          <p className="hero-lead">
            Inicia sesion con tus credenciales de administrador para gestionar empleados, verificacion y horarios.
          </p>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Usuario
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              value={credentials.username}
              onChange={event => setCredentials(prev => ({ ...prev, username: event.target.value }))}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              name="password"
              placeholder="Contrasena"
              value={credentials.password}
              onChange={event => setCredentials(prev => ({ ...prev, password: event.target.value }))}
              required
              autoComplete="current-password"
            />
          </label>
          {loginError && <p className="status error">{loginError}</p>}
          <button type="submit" className="primary" disabled={loginLoading}>
            {loginLoading ? "Validando..." : "Entrar"}
          </button>
          <small className="login-hint">
            Demo: <code>admin</code> / <code>123456</code>
          </small>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [authInfo, setAuthInfo] = useState(() => {
    const stored = readStoredAuth();
    return stored?.token ? stored : null;
  });
  const [sessionExpired, setSessionExpired] = useState(false);
  const [zone, setZone] = useState({ center: { lat: 0, lng: 0 }, radius: 100, name: "" });
  const [zoneName, setZoneName] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [loadingZone, setLoadingZone] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", address: "" });
  const navMenuRef = useRef(null);
  const navToggleRef = useRef(null);
  const sessionHandledRef = useRef(false);
  const originalFetchRef = useRef(window.fetch);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const initial = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const isAdmin = isAdminRole(authInfo);
  const isAuthenticated = Boolean(authInfo?.token);

  const handleSessionExpired = useCallback(() => {
    if (sessionHandledRef.current) return;
    sessionHandledRef.current = true;
    clearStoredAuth();
    setAuthInfo(null);
    setActiveView("home");
    setSessionExpired(true);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (!authInfo?.token) return undefined;
    const expMs = decodeTokenExpirationMs(authInfo.token);
    if (!expMs) return undefined;
    const msLeft = expMs - Date.now();
    if (msLeft <= 0) {
      // Si el reloj local esta adelantado, evitamos cerrar sesion de inmediato y dejamos que el backend lo valide.
      return undefined;
    }
    const timerId = setTimeout(() => handleSessionExpired(), msLeft);
    return () => clearTimeout(timerId);
  }, [authInfo, handleSessionExpired]);

  useEffect(() => {
    const originalFetch = originalFetchRef.current;

    async function wrappedFetch(input, init = {}) {
      const headers = new Headers(init.headers || {});
      if (authInfo?.token) {
        headers.set("Authorization", `Bearer ${authInfo.token}`);
      }

      const response = await originalFetch(input, { ...init, headers });
      const url = typeof input === "string" ? input : input?.url || "";
      const isLoginRequest = url.includes("/auth/login");
      const isFaceIdentify = url.includes("/plantillas/identificar");

      // No expirar sesion cuando la identificacion facial devuelve 401 (caso esperado)
      if (response.status === 401 && !isLoginRequest && !isFaceIdentify && authInfo?.token) {
        handleSessionExpired();
      }
      return response;
    }

    window.fetch = wrappedFetch;
    return () => {
      window.fetch = originalFetch;
    };
  }, [authInfo, handleSessionExpired]);

  useEffect(() => {
    if (authInfo?.token) {
      persistAuth(authInfo);
      sessionHandledRef.current = false;
      setSessionExpired(false);
    } else {
      clearStoredAuth();
    }
  }, [authInfo]);

  useEffect(() => {
    if (!sessionExpired) {
      sessionHandledRef.current = false;
    }
  }, [sessionExpired]);

  useEffect(() => {
    if (isAdmin) {
      loadBranches();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedBranchId) {
      setZone({ center: { lat: 0, lng: 0 }, radius: 100, name: "" });
      setZoneName("");
      return;
    }
    loadZone(selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveView("home");
      return;
    }
    const allowedViews = isAdmin ? ["register", "verify", "schedules", "map", "logs", "profile", "employees"] : [];
    const defaultView = isAdmin ? "register" : "verify";
    if (!allowedViews.includes(activeView)) {
      setActiveView(defaultView);
    }
  }, [isAuthenticated, isAdmin, activeView]);

  async function loadBranches() {
    setLoadingBranches(true);
    try {
      const list = await fetchBranches();
      setBranches(list);
      if (list.length && !selectedBranchId) {
        setSelectedBranchId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBranches(false);
    }
  }

  async function loadZone(branchId) {
    setLoadingZone(true);
    try {
      const zoneData = await fetchZone(branchId);
      if (zoneData) {
        setZone({
          center: zoneData.center || { lat: 0, lng: 0 },
          radius: zoneData.radius || 100,
          name: zoneData.name || ""
        });
        setZoneName(zoneData.name || "");
      } else {
        setZone({ center: { lat: 0, lng: 0 }, radius: 100, name: "" });
        const branchName = branches.find(b => b.id === branchId)?.name || "";
        setZoneName(branchName ? `${branchName} - zona` : "");
      }
    } catch (err) {
      console.error(err);
      setZone({ center: { lat: 0, lng: 0 }, radius: 100, name: "" });
      const branchName = branches.find(b => b.id === branchId)?.name || "";
      setZoneName(branchName ? `${branchName} - zona` : "");
    } finally {
      setLoadingZone(false);
    }
  }

  function toggleMenu() {
    setMenuOpen(prev => !prev);
  }

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClickOutside = event => {
      if (navMenuRef.current?.contains(event.target)) return;
      if (navToggleRef.current?.contains(event.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  function handleSelectView(view) {
    setActiveView(view);
    setMenuOpen(false);
  }

  function handleMenuAction(action) {
    handleSelectView(action);
  }

  function handleLogout() {
    clearStoredAuth();
    sessionHandledRef.current = false;
    setSessionExpired(false);
    setAuthInfo(null);
    setActiveView("home");
    navigate("/");
  }

  function handleLocateMe() {
    if (!navigator?.geolocation) {
      alert("Geolocalizacion no disponible en este navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setZone(prev => ({
          ...prev,
          center: { lat: Number(latitude.toFixed(6)), lng: Number(longitude.toFixed(6)) }
        }));
      },
      () => {
        alert("No se pudo obtener la ubicacion actual.");
      }
    );
  }

  const handleVerifyEntryFlow = useCallback(() => {
    setActiveView("verify");
    navigate("/verify");
  }, [navigate]);

  function handleRadiusChange(val) {
    const next = Number(val);
    if (!Number.isFinite(next)) return;
    setZone(prev => ({ ...prev, radius: next }));
  }

  async function handleSaveZone() {
    let targetBranchId = selectedBranchId;
    let targetZoneName = zoneName.trim();

    // Si no hay sucursal seleccionada pero el usuario escribiÃ³ una nueva, la creamos al vuelo
    if (!targetBranchId) {
      if (!newBranch.name.trim()) {
        alert("Selecciona una sucursal o crea una nueva para guardar la zona");
        return;
      }
      try {
        setSavingBranch(true);
        const created = await createBranch({
          name: newBranch.name.trim(),
          address: newBranch.address || null
        });
        setBranches(prev => [...prev, created]);
        targetBranchId = created.id;
        setSelectedBranchId(created.id);
        setNewBranch({ name: "", address: "" });
      } catch (err) {
        console.error(err);
        alert(err.message || "No se pudo crear la sucursal");
        return;
      } finally {
        setSavingBranch(false);
      }
    }

    // Si no escribiÃ³ nombre de zona, usamos uno por defecto
    if (!targetZoneName) {
      targetZoneName = newBranch.name.trim()
        ? `${newBranch.name.trim()} - zona`
        : "Zona principal";
      setZoneName(targetZoneName);
    }

    try {
      const saved = await saveZone({
        branch_id: targetBranchId,
        name: targetZoneName,
        center: zone.center,
        radius: zone.radius
      });
      setZone({
        center: saved.center || zone.center,
        radius: saved.radius || zone.radius,
        name: saved.name || targetZoneName
      });
      setZoneName(saved.name || targetZoneName);
      alert("Zona guardada");
    } catch (err) {
      alert(err.message || "No se pudo guardar la zona");
    }
  }

  function handleClearZone() {
    setZone({ center: { lat: 0, lng: 0 }, radius: 100, name: "" });
    setZoneName("");
  }

  async function handleCreateBranch() {
    if (!newBranch.name.trim()) {
      alert("Ingresa un nombre para la sucursal");
      return;
    }

    try {
      setSavingBranch(true);
      const created = await createBranch({
        name: newBranch.name.trim(),
        address: newBranch.address || null
      });
      setBranches(prev => [...prev, created]);
      setSelectedBranchId(created.id);
      setNewBranch({ name: "", address: "" });
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo crear la sucursal");
    } finally {
      setSavingBranch(false);
    }
  }

  async function handleDeleteBranch() {
    if (!selectedBranchId) {
      alert("Selecciona una sucursal para eliminar");
      return;
    }

    const branch = branches.find(b => String(b.id) === String(selectedBranchId));
    const name = branch?.name || selectedBranchId;
    if (!window.confirm(`Â¿Eliminar la sucursal "${name}" y sus zonas asociadas?`)) {
      return;
    }

    try {
      setDeletingBranch(true);
      await deleteBranch(selectedBranchId);
      setBranches(prev => prev.filter(b => String(b.id) !== String(selectedBranchId)));

      const remaining = branches.filter(b => String(b.id) !== String(selectedBranchId));
      const nextId = remaining.length ? remaining[0].id : "";
      setSelectedBranchId(nextId);
      setZone({ center: { lat: 0, lng: 0 }, radius: 100, name: "" });
      setZoneName("");
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo eliminar la sucursal");
    } finally {
      setDeletingBranch(false);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Credenciales invalidas");
      }
      if (!data?.token) {
        throw new Error("La respuesta de login no incluyÃ³ un token de sesion");
      }

      setAuthInfo(data);
      sessionHandledRef.current = false;
      setSessionExpired(false);
      setCredentials({ username: "", password: "" });
      navigate("/dashboard");
    } catch (err) {
      setLoginError(err.message || "No se pudo iniciar sesion");
    } finally {
      setLoginLoading(false);
    }
  }

  function renderActiveView() {
    if (!isAdmin) {
      if (activeView === "mySchedules") {
        return (
          <section className="employee-card">
            <header className="employee-card__header">
              <p className="register-subtitle">Mis horarios</p>
              <h2>Tu jornada asignada</h2>
              <p className="register-description">
                Consulta los horarios configurados para ti y revisa tus datos de empleado.
              </p>
            </header>
            <EmployeeSchedule
              employeeId={authInfo?.id_empleado}
              employeeName={[authInfo?.empleado_nombre, authInfo?.empleado_apellido].filter(Boolean).join(" ")}
            />
          </section>
        );
      }

      return (
        <section className="recognition-card">
          <VerifyIntro />
          <FaceRecognition />
        </section>
      );
    }

    if (activeView === "home") {
      return (
        <section className="home-screen">
          <div className="home-hero">
            <div className="hero-copy">
              <p className="eyebrow">Control de asistencia con biometria facial</p>
              <h1 className="hero-title">
                <span className="typing-static">Bienvenido al panel</span>
                <TypewriterTitle
                  sequences={[
                    { text: "Sistema de Reconocimiento", deleteAfter: true },
                    { text: "Marca tu entrada en segundos", deleteAfter: true },
                    { text: "Marca tu salida sin esperas", deleteAfter: true }
                  ]}
                />
              </h1>
              <p className="hero-lead">
                Registra empleados, captura plantillas faciales, gestiona horarios y aplica geolocalizacion para las
                marcaciones. Usa el menu para acceder rapido a cada modulo.
              </p>
              <div className="hero-actions">
                <button type="button" className="primary" onClick={() => handleSelectView("register")}>
                  Registrar empleados
                </button>
                <button type="button" className="ghost" onClick={() => handleSelectView("verify")}>
                  Verificar asistencia
                </button>
              </div>
            </div>

            <div className="hero-card">
              <div className="hero-badge">Flujo rapido</div>
              <p className="hero-highlight">Carga de datos + foto en un solo paso</p>
              <ul>
                <li>Sube o toma la foto desde la camara</li>
                <li>Genera embeddings y registra plantilla</li>
                <li>Marca entrada y salida en segundos</li>
              </ul>
            </div>
          </div>
        </section>
      );
    }

    if (activeView === "map") {
      const MAX_RADIUS = 1000;

      return (
        <section className="map-card">
          <header className="map-header">
            <div>
              <p className="map-subtitle">Geocerca de verificacion</p>
              <div className="register-animated-title">
                <LayoutTextFlip
                  text="Define la geocerca"
                  words={[
                    "autoriza marcaciones en zona",
                    "solo empleados dentro del radio",
                    "configura el punto en segundos"
                  ]}
                />
              </div>
              <p className="map-description">
                Elige una ubicacion en el mapa y establece el radio permitido. Solo los empleados dentro de esa zona
                podran verificarse.
              </p>
            </div>
            <div className="map-legend">
              <span className="dot radius" />
              <small>Radio permitido</small>
            </div>
          </header>

          <div className="map-layout">
            <div className="map-view">
              <MapPicker
                center={zone.center}
                radius={zone.radius}
                onCenterChange={coords => setZone(prev => ({ ...prev, center: coords }))}
              />
            </div>
            <div className="map-controls">
              <label>
                Sucursal
                <select
                  value={selectedBranchId}
                  disabled={loadingBranches}
                  onChange={e => setSelectedBranchId(e.target.value)}
                >
                  <option value="">Selecciona una sucursal</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              {!branches.length && !loadingBranches && (
                <p className="schedule-hint">No hay sucursales. Crea una abajo.</p>
              )}
              {loadingZone && <p className="schedule-hint">Cargando zona...</p>}
              <label>
                Nombre de la zona
                <input
                  type="text"
                  placeholder="Ej. Zona principal"
                  value={zoneName}
                  onChange={e => setZoneName(e.target.value)}
                />
              </label>
              <label>
                Latitud
                <input
                  type="text"
                  placeholder="-16.5"
                  value={zone.center.lat}
                  onChange={e => setZone(prev => ({ ...prev, center: { ...prev.center, lat: Number(e.target.value) || 0 } }))}
                />
              </label>
              <label>
                Longitud
                <input
                  type="text"
                  placeholder="-68.15"
                  value={zone.center.lng}
                  onChange={e => setZone(prev => ({ ...prev, center: { ...prev.center, lng: Number(e.target.value) || 0 } }))}
                />
              </label>
              <label>
                Radio (metros)
                <input
                  type="range"
                  min="50"
                  max={MAX_RADIUS}
                  step="10"
                  value={zone.radius}
                  onChange={e => handleRadiusChange(e.target.value)}
                />
                <div className="slider-value">{zone.radius} m</div>
              </label>
              <div className="map-buttons">
                <button type="button" className="ghost-button" onClick={handleLocateMe}>
                  Usar mi ubicacion
                </button>
                <button type="button" className="primary-btn" onClick={handleSaveZone}>
                  Guardar zona
                </button>
                <button type="button" className="ghost-button" onClick={handleClearZone}>
                  Limpiar seleccion
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={handleDeleteBranch}
                  disabled={deletingBranch || loadingBranches || !selectedBranchId}
                >
                  {deletingBranch ? "Eliminando..." : "Eliminar sucursal"}
                </button>
              </div>
              <p className="schedule-hint">Crear nueva sucursal</p>
              <label>
                Nombre
                <input
                  type="text"
                  placeholder="Ej. Sucursal Central"
                  value={newBranch.name}
                  onChange={e => {
                    const value = e.target.value;
                    setNewBranch(prev => ({ ...prev, name: value }));
                    setZoneName(current => (current ? current : value ? `${value} - zona` : ""));
                  }}
                />
              </label>
              <label>
                Direccion (opcional)
                <input
                  type="text"
                  placeholder="Direccion"
                  value={newBranch.address}
                  onChange={e => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                />
              </label>
              <button type="button" className="ghost-button" onClick={handleCreateBranch} disabled={savingBranch}>
                {savingBranch ? "Creando..." : "Crear sucursal"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (activeView === "logs") {
      return <EmployeeLogs />;
    }

    if (activeView === "profile") {
      return <ProfileCard user={authInfo} />;
    }

    if (activeView === "register") {
      return (
        <section className="register-card">
          <header className="register-header">
            <div>
              <p className="register-subtitle">Registro rapido de empleados</p>
              <div className="register-animated-title">
                <LayoutTextFlip
                  text="Registra al empleado"
                  words={["y su plantilla facial", "con datos + foto", "en un solo paso"]}
                />
              </div>
              <p className="register-description">
                Completa la informacion, adjunta una foto desde tu equipo o usa la camara integrada para tomarla al
                momento.
              </p>
            </div>
          </header>

          <TestEmployeeUpload />
        </section>
      );
    }

    if (activeView === "verify") {
      return (
        <section className="recognition-card">
          <VerifyIntro />
          <FaceRecognition />
        </section>
        );
      }

      if (activeView === "employees") {
        return <EmployeesManager />;
      }

      return (
        <section className="schedule-card">
          <ScheduleManager />
        </section>
      );
  }

  function handleSessionModalClose() {
    clearStoredAuth();
    setAuthInfo(null);
    setActiveView("home");
    sessionHandledRef.current = false;
    setSessionExpired(false);
    navigate("/login");
  }

  return (
    <>
      <SmoothCursor />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onGoHome={() => navigate("/")}
              onEnterApp={handleVerifyEntryFlow}
              onLogin={() => navigate("/login")}
            />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage
                onSubmit={handleLoginSubmit}
                credentials={credentials}
                setCredentials={setCredentials}
                loginError={loginError}
                loginLoading={loginLoading}
              />
            )
          }
        />
        <Route
          path="/verify"
          element={
            <div className="app-shell">
              <main className="workspace">
                <section className="recognition-card">
                  <VerifyIntro />
                  <FaceRecognition />
                </section>
              </main>
            </div>
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <div className="app-shell">
                  <header className="app-nav">
                    <button
                      ref={navToggleRef}
                      className="menu-toggle"
                      type="button"
                      onClick={toggleMenu}
                      aria-label="Abrir menu"
                    >
                      <span />
                      <span />
                      <span />
                    </button>

                    <nav ref={navMenuRef} className={`nav-menu ${menuOpen ? "open" : ""}`}>
                      <button
                        type="button"
                        className={`menu-option ${activeView === "register" ? "active" : ""}`}
                        onClick={() => handleMenuAction("register")}
                      >
                        Registrar
                      </button>
                      <button
                        type="button"
                        className={`menu-option ${activeView === "verify" ? "active" : ""}`}
                        onClick={() => handleMenuAction("verify")}
                      >
                        Verificar
                      </button>
                      <button
                        type="button"
                        className={`menu-option ${activeView === "schedules" ? "active" : ""}`}
                        onClick={() => handleMenuAction("schedules")}
                      >
                        Horarios
                      </button>
                      <button
                        type="button"
                        className={`menu-option ${activeView === "employees" ? "active" : ""}`}
                        onClick={() => handleMenuAction("employees")}
                      >
                        Empleados
                      </button>
                      <button
                        type="button"
                        className={`menu-option ${activeView === "map" ? "active" : ""}`}
                        onClick={() => handleMenuAction("map")}
                      >
                        Mapa
                      </button>
                      <button
                        type="button"
                        className={`menu-option ${activeView === "logs" ? "active" : ""}`}
                        onClick={() => handleMenuAction("logs")}
                      >
                        Historial
                      </button>
                      <button
                        type="button"
                        className={`menu-option ${activeView === "profile" ? "active" : ""}`}
                        onClick={() => handleMenuAction("profile")}
                      >
                        Perfil
                      </button>
                    </nav>

                    <div className="nav-actions">
                      <AnimatedThemeToggler className="theme-toggle" aria-label="Cambiar tema" />
                      <button type="button" onClick={handleLogout} className="primary-btn">
                        Cerrar sesion
                      </button>
                    </div>
                  </header>

                  <main className="workspace">{renderActiveView()}</main>
                </div>
              ) : (
                <div className="app-shell">
                  <header className="app-nav">
                    <div className="nav-actions">
                      <AnimatedThemeToggler className="theme-toggle" aria-label="Cambiar tema" />
                      <button type="button" onClick={handleLogout} className="primary-btn">
                        Cerrar sesion
                      </button>
                    </div>
                  </header>
                  <main className="workspace">
                    <section className="recognition-card">
                      <header className="register-header">
                        <p className="register-subtitle">Acceso restringido</p>
                        <h1>Solo administradores pueden usar este panel</h1>
                        <p className="register-description">Cierra sesiÃ³n e ingresa con una cuenta de administrador.</p>
                      </header>
                    </section>
                  </main>
                </div>
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {sessionExpired && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="session-modal__title">Tu sesion expiro</h3>
            <p className="session-modal__body">Vuelve a iniciar sesion para seguir usando el panel.</p>
            <div className="session-modal__actions">
              <button type="button" className="primary-btn" onClick={handleSessionModalClose}>
                Volver a iniciar sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;





