import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../config/api.js";
import LayoutTextFlip from "./ui/layout-text-flip.jsx";
import { NativeSelect, NativeSelectOption } from "./ui/native-select.jsx";

function buildEmployeeLabel(emp) {
  return `${emp.nombre || ""} ${emp.apellido || ""}`.trim() || `Empleado ${emp.id_empleado}`;
}

export default function EmployeesManager() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({
    ci: "",
    nombre: "",
    apellido: "",
    cargo: "",
    id_departamento: "",
    fecha_ingreso: ""
  });

  const selectedEmployee = useMemo(
    () => employees.find(emp => String(emp.id_empleado) === String(selectedId)),
    [employees, selectedId]
  );

  useEffect(() => {
    loadEmployees();
  }, []);

  function resetForm(emp) {
    setForm({
      ci: emp?.ci || "",
      nombre: emp?.nombre || "",
      apellido: emp?.apellido || "",
      cargo: emp?.cargo || "",
      id_departamento: emp?.id_departamento || "",
      fecha_ingreso: emp?.fecha_ingreso?.slice?.(0, 10) || ""
    });
  }

  async function loadEmployees() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/empleados`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "No se pudieron cargar los empleados");
      }
      setEmployees(data?.empleados || []);
      if (data?.empleados?.length && !selectedId) {
        setSelectedId(data.empleados[0].id_empleado);
        resetForm(data.empleados[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando empleados");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(id) {
    setSelectedId(id);
    const emp = employees.find(e => String(e.id_empleado) === String(id));
    resetForm(emp);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!selectedId) {
      setError("Selecciona un empleado");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const payload = {
        ci: form.ci,
        nombre: form.nombre,
        apellido: form.apellido,
        cargo: form.cargo,
        id_departamento: form.id_departamento ? Number(form.id_departamento) : null,
        fecha_ingreso: form.fecha_ingreso || null
      };

      const response = await fetch(`${API_BASE_URL}/empleados/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo actualizar el empleado");
      }

      const updated = data?.empleado;
      setEmployees(prev =>
        prev.map(emp => (emp.id_empleado === updated?.id_empleado ? { ...emp, ...updated } : emp))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Error actualizando empleado");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const emp = employees.find(e => e.id_empleado === id);
    if (!window.confirm(`¿Eliminar al empleado ${buildEmployeeLabel(emp)}?`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/empleados/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo eliminar el empleado");
      }
      setEmployees(prev => prev.filter(e => e.id_empleado !== id));
      if (String(selectedId) === String(id)) {
        const next = employees.find(e => e.id_empleado !== id);
        setSelectedId(next?.id_empleado || "");
        resetForm(next || {});
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error eliminando empleado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="schedule-card">
      <header>
        <p className="register-subtitle">Empleados</p>
        <div className="register-animated-title">
          <LayoutTextFlip
            text="Gestiona empleados"
            words={["visualiza, edita o elimina", "actualiza datos basicos", "limpia registros obsoletos"]}
          />
        </div>
        <p className="register-description">
          Selecciona un empleado para editar sus datos o eliminarlo. Los cambios se aplican inmediatamente.
        </p>
      </header>

      <div className="schedule-form">
        <NativeSelect
          label="Empleado"
          value={selectedId}
          onChange={e => handleSelect(e.target.value)}
          disabled={loading}
        >
          <NativeSelectOption value="">Selecciona un empleado</NativeSelectOption>
          {employees.map(emp => (
            <NativeSelectOption key={emp.id_empleado} value={emp.id_empleado}>
              {buildEmployeeLabel(emp)} (ID {emp.id_empleado})
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <form className="simple-form" onSubmit={handleSave}>
          <div className="simple-grid">
            <label>
              CI
              <input name="ci" value={form.ci} onChange={handleChange} />
            </label>
            <label>
              Nombre
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </label>
            <label>
              Apellido
              <input name="apellido" value={form.apellido} onChange={handleChange} required />
            </label>
            <label>
              Cargo
              <input name="cargo" value={form.cargo} onChange={handleChange} />
            </label>
            <label>
              ID Departamento
              <input name="id_departamento" value={form.id_departamento} onChange={handleChange} />
            </label>
            <label>
              Fecha ingreso
              <input type="date" name="fecha_ingreso" value={form.fecha_ingreso} onChange={handleChange} />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving || !selectedId}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            {selectedId && (
              <button
                type="button"
                className="ghost-button ghost-button--danger"
                onClick={() => handleDelete(Number(selectedId))}
                disabled={saving}
              >
                Eliminar empleado
              </button>
            )}
          </div>
          {error && <p className="status error">{error}</p>}
        </form>
      </div>

      <div className="schedule-table-wrapper">
        <h3>Listado</h3>
        {loading && <p className="schedule-hint">Cargando empleados...</p>}
        {!loading && !employees.length && <p className="schedule-hint">No hay empleados registrados.</p>}
        {employees.length > 0 && (
          <table className="schedule-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CI</th>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Ingreso</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id_empleado}>
                  <td>{emp.id_empleado}</td>
                  <td>{emp.ci || "-"}</td>
                  <td>{buildEmployeeLabel(emp)}</td>
                  <td>{emp.cargo || "-"}</td>
                  <td>{emp.id_departamento || "-"}</td>
                  <td>{emp.fecha_ingreso?.slice?.(0, 10) || "-"}</td>
                  <td>
                    <button type="button" className="ghost-button" onClick={() => handleSelect(emp.id_empleado)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="ghost-button ghost-button--danger"
                      onClick={() => handleDelete(emp.id_empleado)}
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
