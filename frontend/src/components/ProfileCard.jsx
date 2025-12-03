import React, { useState } from "react";
import API_BASE_URL from "../config/api.js";

function buildAvatar({ nombre, apellido, username }) {
  const initials = [nombre, apellido].filter(Boolean).map(word => word[0]).join("") || (username ? username[0] : "?");
  return initials.slice(0, 2).toUpperCase();
}

function ProfileCard({ user }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const nombre = user?.empleado_nombre || user?.nombre || "";
  const apellido = user?.empleado_apellido || user?.apellido || "";
  const username = user?.username || user?.usuario || "";
  const rol = user?.rol_nombre || user?.rol || user?.rol_nombre?.toString?.();
  const fotoUrl =
    user?.foto || user?.ruta_imagen || user?.foto_url || user?.imagen || user?.avatar || user?.rutaImagen || null;
  const avatarFallback = buildAvatar({ nombre, apellido, username });

  async function handlePasswordChange(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Completa todos los campos.");
      return;
    }
    if (!username && !user?.usuario) {
      setError("No se pudo detectar tu usuario. Vuelve a iniciar sesión e inténtalo de nuevo.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || user?.usuario,
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo actualizar la contraseña");
      }

      setStatus("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Error actualizando contraseña");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="profile-card">
      <header className="register-header">
        <div>
          <p className="register-subtitle">Perfil</p>
          <h2>Tu cuenta de administrador</h2>
          <p className="register-description">Visualiza tus datos y la foto registrada durante el alta.</p>
        </div>
      </header>

      <div className="profile-body">
        <div className="profile-avatar">
          {fotoUrl ? <img src={fotoUrl} alt="Foto de perfil" /> : <span>{avatarFallback}</span>}
        </div>
        <div className="profile-info">
          <div>
            <p className="profile-label">Nombre</p>
            <p className="profile-value">{[nombre, apellido].filter(Boolean).join(" ") || "No especificado"}</p>
          </div>
          <div>
            <p className="profile-label">Usuario</p>
            <p className="profile-value">{username || "No especificado"}</p>
          </div>
          <div>
            <p className="profile-label">Rol</p>
            <p className="profile-value">{rol || "No especificado"}</p>
          </div>
          {user?.id_empleado ? (
            <div>
              <p className="profile-label">ID empleado</p>
              <p className="profile-value">{user.id_empleado}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="profile-security">
        <div>
          <p className="register-subtitle">Seguridad</p>
          <h3>Cambiar contraseña</h3>
          <p className="register-description">Actualiza tu contraseña actual por una nueva.</p>
        </div>
        <form className="profile-password-form" onSubmit={handlePasswordChange}>
          <label>
            Contraseña actual
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Nueva contraseña
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Confirmar contraseña
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {status && <p className="status success">{status}</p>}
          {error && <p className="status error">{error}</p>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Actualizando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ProfileCard;
