function DashboardHeader() {
  return (
    <header className="panel dashboard-header">
      <div className="dashboard-header__text">
        <p className="eyebrow">Panel administrativo</p>
        <h1>Control diario de asistencia</h1>
        <p className="lead">
          Supervisa en tiempo real el cumplimiento de horarios, registra
          incidencias y coordina acciones sin salir del panel.
        </p>
        <div className="dashboard-header__cta">
          <button type="button" className="primary">
            Registrar colaborador
          </button>
          <button type="button" className="ghost">
            Ver configuracion
          </button>
        </div>
      </div>
      <div className="dashboard-header__summary">
        <p className="eyebrow">Resumen del dia</p>
        <p className="summary__value">Entrada activa</p>
        <ul>
          <li>
            <span>Primer turno</span>
            <strong>07:00 - 15:00</strong>
          </li>
          <li>
            <span>Ultima sincronizacion</span>
            <strong>Hace 4 min</strong>
          </li>
          <li>
            <span>Dispositivos en linea</span>
            <strong>12</strong>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default DashboardHeader;
