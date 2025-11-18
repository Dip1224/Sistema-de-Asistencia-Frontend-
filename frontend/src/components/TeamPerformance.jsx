function TeamPerformance({ teams }) {
  return (
    <section className="panel team-performance" aria-label="Resumen por equipo">
      <div className="panel__header">
        <h3>Resumen por equipo</h3>
        <span className="muted">Ultimos 7 dias</span>
      </div>
      <div className="team-performance__grid">
        {teams.map(team => (
          <article key={team.id} className="team-card">
            <div>
              <p className="team-card__name">{team.name}</p>
              <span className="muted">{team.shift}</span>
            </div>
            <div className="team-card__metrics">
              <div>
                <span>Asistencia</span>
                <strong>{team.attendance}</strong>
              </div>
              <div>
                <span>Retrasos</span>
                <strong>{team.late}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TeamPerformance;
