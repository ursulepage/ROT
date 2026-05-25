// src/components/DashboardCard.jsx

function DashboardCard({
  title,
  value,
  color,
  icon,
}) {
  return (
    <div
      className={`${color} text-white p-6 rounded-2xl shadow-lg`}
    >

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-sm opacity-80">
            {title}
          </h2>

          <h1 className="text-3xl font-bold mt-2">
            {value}
          </h1>

        </div>

        <div>
          {icon}
        </div>

      </div>

    </div>
  );
}

export default DashboardCard;