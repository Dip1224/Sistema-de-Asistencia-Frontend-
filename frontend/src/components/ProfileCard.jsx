import React from "react";

function buildAvatar({ nombre, apellido, username }) {
  const initials = [nombre, apellido].filter(Boolean).map(word => word[0]).join("") || (username ? username[0] : "?");
  return initials.slice(0, 2).toUpperCase();
}

function ProfileCard({ user }) {
  const nombre = user?.empleado_nombre || user?.nombre || "";
  const apellido = user?.empleado_apellido || user?.apellido || "";
  const username = user?.username || user?.usuario || "";
  const rol = user?.rol_nombre || user?.rol || user?.rol_nombre?.toString?.();
  const fotoUrl =
    user?.foto || user?.ruta_imagen || user?.foto_url || user?.imagen || user?.avatar || user?.rutaImagen || null;
  const avatarFallback = buildAvatar({ nombre, apellido, username });

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
    </section>
  );
}

export default ProfileCard;
