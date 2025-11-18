function StatCard({ label, value, helper, trend }) {
  const tone = trend?.direction || "neutral";
  return (
    <article className="panel stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {helper && <p className="stat-card__helper">{helper}</p>}
      {trend?.value && (
        <span className={`stat-card__trend stat-card__trend--${tone}`}>
          {trend.value}
        </span>
      )}
    </article>
  );
}

export default StatCard;
