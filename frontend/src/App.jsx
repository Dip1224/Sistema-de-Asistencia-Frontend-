import { useState } from "react";
import TestEmployeeUpload from "./components/TestEmployeeUpload.jsx";
import FaceRecognition from "./components/FaceRecognition.jsx";
import ScheduleManager from "./components/ScheduleManager.jsx";
import API_BASE_URL from "./config/api.js";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("register");
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [authInfo, setAuthInfo] = useState(null);

  const isAuthenticated = Boolean(authInfo);

  function toggleMenu() {
    setMenuOpen(prev => !prev);
  }

  function handleSelectView(view) {
    setActiveView(view);
    setMenuOpen(false);
  }

  function openLogin() {
    setShowLogin(true);
    setMenuOpen(false);
    setLoginError("");
  }

  function closeLogin() {
    if (!loginLoading) {
      setShowLogin(false);
    }
  }

  function handleLogout() {
    setAuthInfo(null);
    setActiveView("register");
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
        throw new Error(data?.error || "Credenciales inválidas");
      }

      setAuthInfo(data);
      setShowLogin(false);
      setCredentials({ username: "", password: "" });
    } catch (err) {
      setLoginError(err.message || "No se pudo iniciar sesión");
    } finally {
      setLoginLoading(false);
    }
  }

  function renderActiveView() {
    if (activeView === "register") {
      return (
        <section className="register-card">
          <header className="register-header">
            <div>
              <p className="register-subtitle">Registro rápido de empleados</p>
              <h1>Sube los datos y captura la foto en un solo paso</h1>
              <p className="register-description">
                Completa la información, adjunta una foto desde tu equipo o usa la cámara integrada para tomarla en el
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
          {isAuthenticated ? (
            <FaceRecognition />
          ) : (
            <div className="locked-panel">
              <h2>Verificación protegida</h2>
              <p>Inicia sesión con tus credenciales para acceder al escáner en vivo.</p>
              <button type="button" onClick={openLogin}>
                Iniciar sesión
              </button>
            </div>
          )}
        </section>
      );
    }

    return (
      <section className="schedule-card">
        {isAuthenticated ? (
          <ScheduleManager />
        ) : (
          <div className="locked-panel">
            <h2>Panel solo para administradores</h2>
            <p>Inicia sesión para gestionar los horarios del personal.</p>
            <button type="button" onClick={openLogin}>
              Iniciar sesión
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-nav">
        <button className="menu-toggle" type="button" onClick={toggleMenu} aria-label="Abrir menú">
          <span />
          <span />
          <span />
        </button>

        <div className="nav-brand">
          <strong>Sistema de Reconocimiento</strong>
          <small>Menú principal</small>
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="ghost-button">
              Cerrar sesión
            </button>
          ) : (
            <button type="button" onClick={openLogin} className="ghost-button">
              Iniciar sesión
            </button>
          )}
        </div>

        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <button
            type="button"
            className={`menu-option ${activeView === "register" ? "active" : ""}`}
            onClick={() => handleSelectView("register")}
          >
            Registrar
          </button>
          <button
            type="button"
            className={`menu-option ${activeView === "verify" ? "active" : ""}`}
            onClick={() => handleSelectView("verify")}
          >
            Verificar
          </button>
          <button
            type="button"
            className={`menu-option ${activeView === "schedules" ? "active" : ""}`}
            onClick={() => handleSelectView("schedules")}
          >
            Horarios
          </button>
        </nav>
      </header>

      <main className="workspace">{renderActiveView()}</main>

      {showLogin && (
        <div className="modal-overlay" onClick={closeLogin}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <h2>Iniciar sesión</h2>
            <p>Usa las credenciales de administración para continuar.</p>
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={credentials.username}
                onChange={event => setCredentials(prev => ({ ...prev, username: event.target.value }))}
                required
                autoComplete="username"
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={event => setCredentials(prev => ({ ...prev, password: event.target.value }))}
                required
                autoComplete="current-password"
              />
              {loginError && <p className="status error">{loginError}</p>}
              <div className="login-actions">
                <button type="button" className="ghost-button" onClick={closeLogin} disabled={loginLoading}>
                  Cancelar
                </button>
                <button type="submit" disabled={loginLoading}>
                  {loginLoading ? "Validando..." : "Acceder"}
                </button>
              </div>
            </form>
            <small className="login-hint">
              Demo: <code>admin</code> / <code>1234</code>
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
