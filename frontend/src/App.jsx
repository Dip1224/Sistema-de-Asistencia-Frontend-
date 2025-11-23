import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import TestEmployeeUpload from "./components/TestEmployeeUpload.jsx";
import FaceRecognition from "./components/FaceRecognition.jsx";
import ScheduleManager from "./components/ScheduleManager.jsx";
import API_BASE_URL from "./config/api.js";
import HeroVideoDialog from "./components/HeroVideoDialog.jsx";
import AnimatedThemeToggler from "./components/AnimatedThemeToggler.jsx";
import SmoothCursor from "./components/SmoothCursor.jsx";
import { fetchZone, saveZone } from "./services/zone.js";
import { fetchBranches, createBranch } from "./services/branches.js";
import MapPicker from "./components/MapPicker.jsx";

function HomePage({ onEnterApp, onLogin }) {
  return (
    <div className="home-shell">
      <header className="app-nav floating">
        <nav className="nav-menu">
          <button type="button" className="menu-option active" onClick={onEnterApp}>
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
              <h1>
                Bienvenido al panel <span>Sistema de Reconocimiento</span>
              </h1>
              <p className="hero-lead">
                Registra empleados, captura plantillas faciales y gestiona horarios desde un solo lugar. Usa el menu
                para acceder rapido a cada modulo.
              </p>
              <div className="hero-actions">
                <button type="button" className="primary" onClick={onEnterApp}>
                  Ir al panel
                </button>
                <button type="button" className="ghost" onClick={onLogin}>
                  Iniciar sesion
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

          <div className="home-video">
            <h3>Así funciona</h3>
            <p>Reproduce un breve video de la experiencia de registro y verificación.</p>
            <HeroVideoDialog
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
              thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
              darkThumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
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
            Contraseña
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
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
            Demo: <code>admin</code> / <code>1234</code>
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
  const [authInfo, setAuthInfo] = useState(null);
  const [zone, setZone] = useState({ center: { lat: 0, lng: 0 }, radius: 100, name: "" });
  const [zoneName, setZoneName] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [loadingZone, setLoadingZone] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", address: "" });
  const navigate = useNavigate();

  const isAuthenticated = Boolean(authInfo);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) {
      setZone({ center: { lat: 0, lng: 0 }, radius: 100, name: "" });
      setZoneName("");
      return;
    }
    loadZone(selectedBranchId);
  }, [selectedBranchId]);

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

  function handleSelectView(view) {
    setActiveView(view);
    setMenuOpen(false);
  }

  function handleMenuAction(action) {
    handleSelectView(action);
  }

  function handleLogout() {
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

  function handleRadiusChange(val) {
    const next = Number(val);
    if (!Number.isFinite(next)) return;
    setZone(prev => ({ ...prev, radius: next }));
  }

  async function handleSaveZone() {
    let targetBranchId = selectedBranchId;
    let targetZoneName = zoneName.trim();

    // Si no hay sucursal seleccionada pero el usuario escribió una nueva, la creamos al vuelo
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

    // Si no escribió nombre de zona, usamos uno por defecto
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

      setAuthInfo(data);
      setCredentials({ username: "", password: "" });
      navigate("/dashboard");
    } catch (err) {
      setLoginError(err.message || "No se pudo iniciar sesion");
    } finally {
      setLoginLoading(false);
    }
  }

  function renderActiveView() {
    if (activeView === "home") {
      return (
        <section className="home-screen">
          <div className="home-hero">
            <div className="hero-copy">
              <p className="eyebrow">Control de asistencia con biometria facial</p>
              <h1>
                Bienvenido al panel <span>Sistema de Reconocimiento</span>
              </h1>
              <p className="hero-lead">
                Registra empleados, captura plantillas faciales y gestiona horarios desde un solo lugar. Usa el menu
                para acceder rapido a cada modulo.
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
              <h2>Define un punto y radio para autorizar marcaciones</h2>
              <p className="map-description">
                Elige una ubicacion en el mapa y establece el radio permitido. Solo los empleados dentro de esa zona
                podran verificarse.
              </p>
            </div>
            <div className="map-legend">
              <span className="dot center" />
              <small>Punto central</small>
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

    if (activeView === "register") {
      return (
        <section className="register-card">
          <header className="register-header">
            <div>
              <p className="register-subtitle">Registro rapido de empleados</p>
              <h1>Sube los datos y captura la foto en un solo paso</h1>
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
          <FaceRecognition />
        </section>
      );
    }

    return (
      <section className="schedule-card">
        <ScheduleManager />
      </section>
    );
  }

  return (
    <>
      <SmoothCursor />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onEnterApp={() => (isAuthenticated ? navigate("/dashboard") : navigate("/login"))}
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
          path="/dashboard"
          element={
            isAuthenticated ? (
              <div className="app-shell">
                <header className="app-nav">
                  <button className="menu-toggle" type="button" onClick={toggleMenu} aria-label="Abrir menu">
                    <span />
                    <span />
                    <span />
                  </button>

                  <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
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
                    className={`menu-option ${activeView === "map" ? "active" : ""}`}
                    onClick={() => handleMenuAction("map")}
                  >
                    Mapa
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
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
