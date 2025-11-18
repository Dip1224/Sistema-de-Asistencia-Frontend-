const TYPE_LABELS = {
  check: "Registro",
  incident: "Incidencia",
  schedule: "Turno",
  device: "Sensor"
};

function ActivityTimeline({ activities }) {
  return (
    <section className="panel timeline" aria-label="Actividad reciente">
      <div className="panel__header">
        <h3>Actividad reciente</h3>
        <span className="muted">{activities.length} eventos</span>
      </div>
      <ul className="timeline__list">
        {activities.map(activity => (
          <li key={activity.id} className="timeline__item">
            <span className="timeline__time">{activity.time}</span>
            <div>
              <span className={`badge badge--${activity.type}`}>
                {TYPE_LABELS[activity.type] || "Evento"}
              </span>
              <p>{activity.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActivityTimeline;
