import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import TestEmployeeUpload from "./components/TestEmployeeUpload.jsx";
import FaceRecognition from "./components/FaceRecognition.jsx";
import ScheduleManager from "./components/ScheduleManager.jsx";
import API_BASE_URL from "./config/api.js";
import HeroVideoDialog from "./components/HeroVideoDialog.jsx";
import AnimatedThemeToggler from "./components/AnimatedThemeToggler.jsx";
import SmoothCursor from "./components/SmoothCursor.jsx";

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
  const navigate = useNavigate();

  const isAuthenticated = Boolean(authInfo);

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
