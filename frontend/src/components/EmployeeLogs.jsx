import { useEffect, useState } from "react";
import { fetchEmployeeLogs } from "../services/logs.js";

function eventClass(evento) {
  const kind = (evento || "").toUpperCase();
  if (kind === "DELETE") return "log-pill danger";
  if (kind === "UPDATE") return "log-pill warning";
  return "log-pill success";
}

function formatDate(value) {
  if (!value) return "N/D";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function EmployeeLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchEmployeeLogs(200);
        setLogs(data);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los logs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="logs-card">
      <header className="register-header">
        <div>
          <p className="register-subtitle">Historial de empleados</p>
          <h1>Inserciones, cambios y eliminaciones</h1>
          <p className="register-description">
            Revisa las últimas acciones realizadas sobre los empleados. Solo visible para administradores.
          </p>
        </div>
      </header>

      {loading && <p className="schedule-hint">Cargando historial...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <div className="logs-table">
          <div className="logs-header">
            <span>Fecha</span>
            <span>Empleado</span>
            <span>Evento</span>
            <span>Usuario DB</span>
            <span>IP</span>
            <span>Detalle</span>
          </div>
          {logs.length === 0 && <p className="schedule-hint">No hay eventos registrados.</p>}
          {logs.map(log => (
            <div key={log.id_log || `${log.id_empleado}-${log.fecha_evento}`} className="logs-row">
              <span>{formatDate(log.fecha_evento)}</span>
              <span>{log.id_empleado ?? "N/D"}</span>
              <span>
                <span className={eventClass(log.evento)}>{log.evento || "N/D"}</span>
              </span>
              <span>{log.usuario || "N/D"}</span>
              <span>{log.ip || "N/D"}</span>
              <span className="logs-detail">{log.data || "Sin detalle"}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
