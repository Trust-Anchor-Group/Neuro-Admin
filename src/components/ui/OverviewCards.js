const OverviewCards = () => {
  const cards = [
    {
      title: "Amount Sold",
      value: "7000 EUR",
      info: "+28% Since last month",
    },
    {
      title: "Total Volume Compensated",
      value: "300 tons Co2",
      info: "90 tons in progress, 210 tons ordered",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-[var(--brand-navbar)] border border-[var(--brand-border)] rounded-lg p-6 transform hover:scale-105 transition`}
        >
          <h3 className="text-lg font-semibold text-blue-500">{card.title}</h3>
          <p className="text-4xl font-extrabold text-[var(--brand-text)]">{card.value}</p>
          <span className="text-sm text-green-600">{card.info}</span>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
