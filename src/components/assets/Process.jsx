import React from "react";
import {
  AlertCircle,
  BadgeEuro,
  ChevronDown,
  Leaf,
  Search,
} from "lucide-react";

const statusSnapshot = {
  label: "Status",
  state: "In progress",
  completion: 75,
  volume: "47 tons",
  nextMilestone: "Next milestone: Site verification on Aug 22",
  lastUpdated: "Updated 12 hours ago",
};

const compensationTotal = [
  { label: "Feb 02", value: 5 },
  { label: "Mar 15", value: 18 },
  { label: "May 01", value: 32 },
  { label: "Jul 10", value: 48 },
  { label: "Sep 22", value: 63 },
  { label: "Dec 04", value: 71 },
  { label: "Feb 15", value: 73 },
];

const compensationRelative = [
  { label: "Feb 02", value: 9, bottomLabel: "4 tons" },
  { label: "Mar 15", value: 5, bottomLabel: "5 tons" },
  { label: "Apr 22", value: 12, bottomLabel: "7 tons" },
  { label: "May 30", value: 8, bottomLabel: "9 tons" },
  { label: "Jun 18", value: 15, bottomLabel: "11 tons" },
  { label: "Jul 25", value: 10, bottomLabel: "13 tons" },
  { label: "Aug 12", value: 17, bottomLabel: "16 tons" },
];

const compensationSeries = {
  total: {
    key: "total",
    label: "Total",
    description: "Tracking compensated volume over time",
    maxValue: 100,
    points: compensationTotal,
    yTicks: [25, 50, 75],
    rightAxis: [
      { value: 73, label: "73 tons" },
      { value: 58, label: "58 tons" },
      { value: 37, label: "37 tons" },
      { value: 19, label: "19 tons" },
      { value: 0, label: "0 tons" },
    ],
    bottomLabel: (point) => `${point.value} tons`,
  },
  relative: {
    key: "relative",
    label: "Relative",
    description: "Comparing each phase share of the total order",
    maxValue: 25,
    points: compensationRelative,
    yTicks: [5, 10, 15, 20],
    rightAxis: [
      { value: 19, label: "19 tons" },
      { value: 16, label: "16 tons" },
      { value: 12, label: "12 tons" },
      { value: 8, label: "8 tons" },
      { value: 0, label: "0 tons" },
    ],
    bottomLabel: (point) => point.bottomLabel,
  },
};

const summaryHighlights = [
  { label: "Total value", value: "173 TEUR", Icon: BadgeEuro },
  { label: "Total compensation", value: "47 tons", Icon: Leaf },
];

const Process = () => {
  const [progressView, setProgressView] = React.useState("total");

  const progressBarWidth = Math.min(Math.max(statusSnapshot.completion, 0), 100);

  const chartWidth = 360;
  const chartHeight = 160;

  const selectedSeries =
    compensationSeries[progressView] ?? compensationSeries.total;
  const chartPoints = selectedSeries.points;

  const defaultMax =
    typeof selectedSeries.maxValue === "number" && selectedSeries.maxValue > 0
      ? selectedSeries.maxValue
      : 1;

  let chartGeometry = { path: "", points: [], maxValue: defaultMax };

  if (chartPoints.length) {
    const maxValueCandidate = Math.max(...chartPoints.map((point) => point.value));
    const maxValue =
      typeof selectedSeries.maxValue === "number" && selectedSeries.maxValue > 0
        ? selectedSeries.maxValue
        : Math.max(maxValueCandidate, 1);
    const stepX =
      chartPoints.length < 2
        ? chartWidth
        : chartWidth / (chartPoints.length - 1);

    const points = chartPoints.map((point, index) => {
      const x = Math.round(index * stepX);
      const y =
        chartHeight -
        Math.round(((point.value ?? 0) / maxValue) * (chartHeight - 16));
      return { x, y };
    });

    const path = points
      .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x},${y}`)
      .join(" ");

    chartGeometry = { path, points, maxValue };
  }

  const getYPosition = (value) =>
    chartGeometry.maxValue > 0
      ? chartHeight -
        Math.round((value / chartGeometry.maxValue) * (chartHeight - 16))
      : chartHeight;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_50%]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
            <header className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--brand-text-secondary)]">
                  {statusSnapshot.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--brand-text)]">
                  {statusSnapshot.completion}% complete
                </p>
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  {statusSnapshot.lastUpdated}
                </p>
              </div>
              <span className="inline-flex items-center rounded-md bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">
                {statusSnapshot.state}
              </span>
            </header>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm font-medium text-[var(--brand-text-secondary)]">
                  <span>Progress</span>
                  <span>{statusSnapshot.completion}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[var(--brand-border)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"
                    style={{ width: `${progressBarWidth}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-center text-sm font-semibold text-purple-600">
                {statusSnapshot.volume}
              </div>
            </div>

            <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
              <p className="text-sm text-[var(--brand-text-secondary)]">
                {statusSnapshot.nextMilestone}
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-200"
              >
                <AlertCircle className="h-4 w-4" />
                Terminate process
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[var(--brand-text)]">
                  Compensation progress
                </h2>
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  {selectedSeries.description}
                </p>
              </div>
              <div className="inline-flex rounded-full bg-[var(--brand-background)] p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setProgressView("relative")}
                  className={`rounded-full px-4 py-1 transition ${
                    progressView === "relative"
                      ? "bg-white text-[var(--brand-text)] shadow-sm"
                      : "text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"
                  }`}
                >
                  Relative
                </button>
                <button
                  type="button"
                  onClick={() => setProgressView("total")}
                  className={`rounded-full px-4 py-1 transition ${
                    progressView === "total"
                      ? "bg-white text-[var(--brand-text)] shadow-sm"
                      : "text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)]"
                  }`}
                >
                  Total
                </button>
              </div>
            </div>

            <div className="relative">
              <svg
                className="h-56 w-full overflow-visible"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                role="img"
                aria-label="Compensation progress line graph"
              >
                <defs>
                  <linearGradient id="compensated" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.25)" />
                    <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                  </linearGradient>
                </defs>

                {chartGeometry.points.length === 0 && (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    fill="var(--brand-text-secondary)"
                    fontSize="12"
                  >
                    No data available
                  </text>
                )}

                {chartGeometry.points.length > 0 &&
                  selectedSeries.yTicks?.map((tick) => {
                    const y = getYPosition(tick);
                    return (
                      <line
                        key={`tick-${tick}`}
                        x1="0"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="var(--brand-border)"
                        strokeDasharray="4 6"
                      />
                    );
                  })}

                {chartGeometry.path && (
                  <>
                    <path
                      d={`${chartGeometry.path} L${chartWidth},${chartHeight} L0,${chartHeight} Z`}
                      fill="url(#compensated)"
                    />
                    <path
                      d={chartGeometry.path}
                      fill="none"
                      stroke="#9f67ff"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {chartGeometry.points.map(({ x, y }, index) => (
                      <circle
                        key={`${x}-${y}`}
                        cx={x}
                        cy={y}
                        r={4}
                        fill="#9f67ff"
                        className={
                          index === chartGeometry.points.length - 1
                            ? "ring-4 ring-purple-100"
                            : ""
                        }
                      />
                    ))}
                  </>
                )}
              </svg>

              {selectedSeries.rightAxis?.length ? (
                <div className="pointer-events-none absolute inset-0">
                  {selectedSeries.rightAxis.map((mark) => {
                    const y = getYPosition(mark.value);
                    return (
                      <span
                        key={mark.label}
                        className="absolute right-0 -translate-y-1/2 text-xs text-[var(--brand-text-secondary)]"
                        style={{ top: `${Math.max(12, Math.min(chartHeight - 4, y))}px` }}
                      >
                        {mark.label}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--brand-text-secondary)] sm:grid-cols-4">
                {chartPoints.map((point) => (
                  <div key={point.label} className="flex flex-col">
                    <span className="text-sm font-semibold text-[var(--brand-text)]">
                      {selectedSeries.bottomLabel(point)}
                    </span>
                    <span>{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {summaryHighlights.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--brand-text)]">
                    {item.value}
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <item.Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[var(--brand-text)]">
                Process activity
              </h2>
              <p className="text-sm text-[var(--brand-text-secondary)]">
                Hard-coded preview until activity feed is connected
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <label className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-[var(--brand-text-secondary)]" />
              <input
                type="search"
                placeholder="Search updates"
                className="w-full rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] py-2 pl-9 pr-3 text-sm text-[var(--brand-text)] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-300"
              />
            </label>
            <button
              type="button"
              className="inline-flex items-center justify-between gap-2 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
            >
              <span>All</span>
              <ChevronDown className="h-4 w-4 text-[var(--brand-text-secondary)]" />
            </button>
          </div>

          <div className="mt-10 flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-background)] text-center">
            <p className="text-sm font-medium text-[var(--brand-text-secondary)]">
              Activity feed coming soon
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Process;
