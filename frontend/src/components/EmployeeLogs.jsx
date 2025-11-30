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
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("fecha_evento");
  const [sortDir, setSortDir] = useState("desc");

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

  function applyFilterAndSort(list) {
    let next = list;
    const term = filterText.trim().toLowerCase();
    if (term) {
      next = next.filter(item => {
        return (
          (item.data || "").toLowerCase().includes(term) ||
          (item.usuario || "").toLowerCase().includes(term) ||
          (item.evento || "").toLowerCase().includes(term) ||
          String(item.id_empleado || "").toLowerCase().includes(term)
        );
      });
    }

    next = [...next].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "fecha_evento") {
        return (new Date(a.fecha_evento) - new Date(b.fecha_evento)) * dir;
      }
      if (sortBy === "id_empleado") {
        return ((a.id_empleado || 0) - (b.id_empleado || 0)) * dir;
      }
      return 0;
    });

    return next;
  }

  function toggleSort(column) {
    if (sortBy === column) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
  }

  const visibleLogs = applyFilterAndSort(logs);

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

      <div className="logs-toolbar">
        <input
          type="search"
          placeholder="Filtrar por empleado, usuario, evento o detalle"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />
        <div className="logs-sort">
          <button type="button" onClick={() => toggleSort("fecha_evento")}>
            Fecha {sortBy === "fecha_evento" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button type="button" onClick={() => toggleSort("id_empleado")}>
            Empleado {sortBy === "id_empleado" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
        </div>
      </div>

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
          {visibleLogs.length === 0 && <p className="schedule-hint">No hay eventos registrados.</p>}
          {visibleLogs.map(log => (
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
