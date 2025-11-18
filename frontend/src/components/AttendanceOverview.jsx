const STATUS_LABELS = {
  onTime: "a tiempo",
  late: "retraso",
  absence: "sin registro"
};

function AttendanceOverview({ items }) {
  return (
    <section className="panel attendance" aria-label="Asistencias de hoy">
      <div className="panel__header">
        <div>
          <h2>Asistencias de hoy</h2>
          <p className="muted">Actualizado hace 2 minutos</p>
        </div>
        <button type="button" className="ghost">
          Ver historial
        </button>
      </div>

      <div className="attendance__list">
        {items.map(item => (
          <AttendanceRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function AttendanceRow({ item }) {
  const initials = item.name
    .split(" ")
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
  const badgeClass = `badge badge--${item.status}`;

  return (
    <article className="attendance-row">
      <div className="attendance-row__person">
        <span className="avatar" aria-hidden="true">
          {initials}
        </span>
        <div>
          <p className="attendance-row__name">{item.name}</p>
          <span className="muted">{item.role}</span>
        </div>
      </div>

      <div className="attendance-row__info">
        <span className={badgeClass}>{STATUS_LABELS[item.status] || "sin dato"}</span>
        <div className="attendance-row__times">
          <span>
            Entrada{" "}
            {item.checkIn ? (
              <time dateTime={item.checkIn}>{item.checkIn}</time>
            ) : (
              "pendiente"
            )}
          </span>
          <span>
            Salida{" "}
            {item.checkOut ? (
              <time dateTime={item.checkOut}>{item.checkOut}</time>
            ) : (
              "pendiente"
            )}
          </span>
        </div>
        {item.note && <p className="muted">{item.note}</p>}
      </div>
    </article>
  );
}

export default AttendanceOverview;
