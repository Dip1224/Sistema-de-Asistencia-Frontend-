import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../config/api.js";
import { NativeSelect, NativeSelectOption } from "./ui/native-select.jsx";
const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" }
];

function ScheduleManager() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDays, setSelectedDays] = useState(() => new Set([1, 2, 3, 4, 5]));
  const [horaEntrada, setHoraEntrada] = useState("09:00");
  const [horaSalida, setHoraSalida] = useState("13:00");
  const [tolerancia, setTolerancia] = useState(5);
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      try {
        const response = await fetch(`${API_BASE_URL}/empleados`);
        const data = await response.json();
        setEmployees(data?.empleados || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) {
      setHorarios([]);
      return;
    }

    async function loadSchedules() {
      try {
        setLoadingHorarios(true);
        const response = await fetch(`${API_BASE_URL}/horarios/empleado/${selectedEmployee}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "No se pudieron obtener los horarios");
        }
        setHorarios(data?.horarios || []);
      } catch (err) {
        console.error(err);
        setHorarios([]);
      } finally {
        setLoadingHorarios(false);
      }
    }

    loadSchedules();
  }, [selectedEmployee]);

  function toggleDay(day) {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    setError("");

    if (!selectedEmployee) {
      setError("Selecciona un empleado");
      return;
    }

    if (!selectedDays.size) {
      setError("Selecciona al menos un día");
      return;
    }

    setSaving(true);

    try {
      for (const dia of selectedDays) {
        const response = await fetch(`${API_BASE_URL}/horarios/registrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_empleado: Number(selectedEmployee),
            dia_semana: dia,
            hora_entrada: horaEntrada,
            hora_salida: horaSalida,
            tolerancia_minutos: Number(tolerancia)
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || "No se pudo registrar el horario");
        }
      }

      setFeedback("Horarios registrados correctamente.");
      await refreshHorarios();
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error registrando el horario");
    } finally {
      setSaving(false);
    }
  }

  async function refreshHorarios() {
    if (!selectedEmployee) return;
    try {
      setLoadingHorarios(true);
      const response = await fetch(`${API_BASE_URL}/horarios/empleado/${selectedEmployee}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error();
      }
      setHorarios(data?.horarios || []);
    } catch (err) {
      console.error(err);
      setHorarios([]);
    } finally {
      setLoadingHorarios(false);
    }
  }

  async function handleDelete(idHorario) {
    if (!window.confirm("¿Eliminar este horario?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/horarios/${idHorario}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo eliminar el horario");
      }
      await refreshHorarios();
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error eliminando el horario");
    }
  }

  const dayList = useMemo(() => Array.from(selectedDays).sort((a, b) => a - b), [selectedDays]);

  return (
    <section className="schedule-card">
      <header>
        <p className="register-subtitle">Control horario</p>
        <h2>Define la jornada para cada empleado</h2>
        <p className="register-description">
          Selecciona el empleado, elige los días y establece su horario de entrada y salida.
        </p>
      </header>

      <form className="schedule-form" onSubmit={handleSubmit}>
        <NativeSelect
          label="Empleado"
          value={selectedEmployee}
          onChange={event => setSelectedEmployee(event.target.value)}
          required
        >
          <NativeSelectOption value="">Selecciona un empleado</NativeSelectOption>
          {employees.map(emp => (
            <NativeSelectOption key={emp.id_empleado} value={emp.id_empleado}>
              {emp.nombre} {emp.apellido} (ID {emp.id_empleado})
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <div>
          <p className="field-label">Días de la semana</p>
          <div className="day-grid">
            {DAYS.map(day => (
              <button
                type="button"
                key={day.value}
                className={`day-pill ${selectedDays.has(day.value) ? "active" : ""}`}
                onClick={() => toggleDay(day.value)}
              >
                {day.label.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="schedule-row">
          <label>
            Hora entrada
            <input
              type="time"
              value={horaEntrada}
              onChange={event => setHoraEntrada(event.target.value)}
              required
            />
          </label>
          <label>
            Hora salida
            <input
              type="time"
              value={horaSalida}
              onChange={event => setHoraSalida(event.target.value)}
              required
            />
          </label>
          <label>
            Tolerancia (min)
            <input
              type="number"
              min="0"
              max="120"
              value={tolerancia}
              onChange={event => setTolerancia(event.target.value)}
              required
            />
          </label>
        </div>

        {dayList.length > 0 && (
          <p className="schedule-summary">
            Se registrará el horario para: {dayList.map(value => DAYS.find(d => d.value === value)?.label).join(", ")}
          </p>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar horario"}
        </button>

        {feedback && <p className="status success">{feedback}</p>}
        {error && <p className="status error">{error}</p>}
      </form>

      <div className="schedule-table-wrapper">
        <h3>Horarios registrados</h3>
        {!selectedEmployee && <p className="schedule-hint">Selecciona un empleado para ver sus horarios.</p>}
        {selectedEmployee && loadingHorarios && <p className="schedule-hint">Cargando horarios...</p>}
        {selectedEmployee && !loadingHorarios && horarios.length === 0 && (
          <p className="schedule-hint">No hay horarios registrados para este empleado.</p>
        )}

        {horarios.length > 0 && (
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Día</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Tolerancia (min)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {horarios.map(horario => (
                <tr key={horario.id_horario}>
                  <td>{DAYS.find(day => day.value === horario.dia_semana)?.label || horario.dia_semana}</td>
                  <td>{horario.hora_entrada?.slice(0, 5)}</td>
                  <td>{horario.hora_salida?.slice(0, 5)}</td>
                  <td>{horario.tolerancia_minutos}</td>
                  <td>
                    <button
                      type="button"
                      className="ghost-button ghost-button--danger"
                      onClick={() => handleDelete(horario.id_horario)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default ScheduleManager;
