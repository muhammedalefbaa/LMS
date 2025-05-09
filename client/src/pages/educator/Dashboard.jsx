import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import assets, { dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/student/Loading";

export default function Dashboard() {
  const { currency } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    // In real usage, this could be an API call
    setDashboardData(dummyDashboardData);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!dashboardData) return <Loading />;

  const { enrolledStudentsData = [], totalCourses = 0, totalEarnings = 0 } = dashboardData;

  const formattedEarnings = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
  }).format(totalEarnings);

  return (
    <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="flex flex-wrap gap-5 items-center">
          <SummaryCard
            icon={assets.patients_icon}
            value={enrolledStudentsData.length}
            label="Total Enrollments"
          />
          <SummaryCard
            icon={assets.appointments_icon}
            value={totalCourses}
            label="Total Courses"
          />
          <SummaryCard
            icon={assets.earning_icon}
            value={formattedEarnings}
            label="Total Earnings"
          />
        </div>

        {/* Latest Enrollments Table */}
        <div>
          <h2 className="pb-4 text-lg font-medium">Latest Enrollments</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500 mb-5">
            <table className="text-gray-900 border-b border-gray-500/20 w-full">
              <thead className="text-sm text-left border-b border-gray-500/20">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {enrolledStudentsData.map((student, index) => (
                  <tr key={`${student.student.id || index}`} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                    <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                      <img
                        src={student.student.imageUrl}
                        alt="profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="truncate">{student.student.name}</span>
                    </td>
                    <td className="px-4 py-3">{student.courseTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable summary card component
function SummaryCard({ icon, value, label }) {
  return (
    <div className="flex items-center gap-3 shadow-card border border-gray-500 p-4 w-56 rounded-md">
      <img src={icon} alt={label} />
      <div>
        <p className="text-2xl font-medium text-gray-600">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
