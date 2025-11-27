import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../config/api.js";

const DAY_LABELS = {
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sabado",
  7: "Domingo"
};

function EmployeeSchedule({ employeeId, employeeName }) {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) return;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/horarios/empleado/${employeeId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || "No se pudieron cargar tus horarios");
        }
        setHorarios(data?.horarios || []);
      } catch (err) {
        setError(err.message || "Ocurrió un error cargando tus horarios");
        setHorarios([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [employeeId]);

  const sortedHorarios = useMemo(
    () => [...horarios].sort((a, b) => (a.dia_semana || 0) - (b.dia_semana || 0)),
    [horarios]
  );

  if (!employeeId) {
    return <p className="schedule-hint">No se pudo identificar tu empleado. Vuelve a iniciar sesión.</p>;
  }

  return (
    <div className="employee-schedule">
      <div className="employee-meta">
        <p>
          <strong>ID empleado:</strong> {employeeId}
        </p>
        {employeeName && (
          <p>
            <strong>Nombre:</strong> {employeeName}
          </p>
        )}
      </div>

      {loading && <p className="schedule-hint">Cargando tus horarios...</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && sortedHorarios.length === 0 && (
        <p className="schedule-hint">Aún no tienes horarios asignados.</p>
      )}

      {sortedHorarios.length > 0 && (
        <div className="employee-schedule__list">
          {sortedHorarios.map(h => (
            <div key={h.id_horario || `${h.dia_semana}-${h.hora_entrada}`} className="employee-schedule__item">
              <div>
                <p className="employee-schedule__day">{DAY_LABELS[h.dia_semana] || `Día ${h.dia_semana}`}</p>
                <p className="employee-schedule__tolerancia">Tolerancia: {h.tolerancia_minutos} min</p>
              </div>
              <div className="employee-schedule__times">
                <div>
                  <small>Entrada</small>
                  <strong>{h.hora_entrada?.slice(0, 5) || "--:--"}</strong>
                </div>
                <div>
                  <small>Salida</small>
                  <strong>{h.hora_salida?.slice(0, 5) || "--:--"}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeSchedule;
