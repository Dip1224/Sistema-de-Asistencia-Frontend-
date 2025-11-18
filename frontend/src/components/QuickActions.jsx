function QuickActions({ actions }) {
  return (
    <section className="panel quick-actions" aria-label="Acciones rapidas">
      <div className="panel__header">
        <h3>Acciones rapidas</h3>
        <span className="muted">Todo queda registrado</span>
      </div>
      <div className="quick-actions__grid">
        {actions.map(action => (
          <button key={action.id} type="button" className="quick-actions__card">
            <strong>{action.label}</strong>
            <span className="muted">{action.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
