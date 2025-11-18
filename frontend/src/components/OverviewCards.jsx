import StatCard from "./StatCard.jsx";

function OverviewCards({ stats }) {
  return (
    <section className="overview-grid" aria-label="Indicadores clave">
      {stats.map(stat => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </section>
  );
}

export default OverviewCards;
