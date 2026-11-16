
import { useState } from "react";
import {
  LayoutDashboard, Users, Wrench, ClipboardList,
  Settings, Bell, Search, Menu, Plus, ArrowUpRight,
  Clock, CheckCircle, AlertCircle, LogOut
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Customers", icon: Users },
  { name: "Service Requests", icon: ClipboardList },
  { name: "Repair Jobs", icon: Wrench },
  { name: "Settings", icon: Settings },
];

function App() {
  const [active, setActive] = useState("Dashboard");

  const stats = [
    { title: "Total Requests", value: "128", change: "+12 this week", icon: ClipboardList },
    { title: "Active Repairs", value: "36", change: "Currently in progress", icon: Wrench },
    { title: "Completed Jobs", value: "84", change: "+8 this week", icon: CheckCircle },
    { title: "Pending Follow-ups", value: "12", change: "Needs attention", icon: Clock },
  ];

  const jobs = [
    { id: "KF-1001", customer: "Aarav Sharma", device: "Washing Machine", status: "In Progress", date: "16 Nov 2026" },
    { id: "KF-1002", customer: "Priya Verma", device: "Refrigerator", status: "Pending", date: "16 Nov 2026" },
    { id: "KF-1003", customer: "Rohan Mehta", device: "Air Conditioner", status: "Completed", date: "15 Nov 2026" },
    { id: "KF-1004", customer: "Ananya Singh", device: "Microwave", status: "In Progress", date: "15 Nov 2026" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb] md:flex">

      <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:min-h-screen">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="bg-orange-500 text-white p-2 rounded-xl">
            <Wrench size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold">KaamFlow</h1>
            <p className="text-xs text-gray-500">Repair Intelligence</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2">
            Workspace
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  active === item.name
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-4">
          <div className="bg-orange-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-orange-800">
              FixLoop Intelligence
            </p>
            <p className="text-xs text-orange-700 mt-2">
              Track repair outcomes and improve service quality.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 md:px-8 py-5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">Workspace / {active}</p>
            <h2 className="text-xl font-bold mt-1">{active}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 border border-gray-200 rounded-xl text-gray-600">
              <Search size={19} />
            </button>
            <button className="p-2 border border-gray-200 rounded-xl text-gray-600">
              <Bell size={19} />
            </button>
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        <div className="p-5 md:p-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-7">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, Admin!
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Here's what's happening with your repair operations.
              </p>
            </div>

            <button
              onClick={() => setActive("Service Requests")}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-semibold"
            >
              <Plus size={18} /> New Request
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mt-4">{stat.value}</h3>
                  <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 flex flex-wrap justify-between items-center gap-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-lg">Recent Repair Jobs</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Overview of recent service activities
                </p>
              </div>
              <button
                onClick={() => setActive("Repair Jobs")}
                className="text-orange-600 text-sm font-semibold flex items-center gap-1"
              >
                View all <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[650px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="p-4">Job ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Equipment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-t border-gray-100 text-sm">
                      <td className="p-4 font-semibold">{job.id}</td>
                      <td className="p-4">{job.customer}</td>
                      <td className="p-4">{job.device}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.status === "Completed"
                            ? "bg-green-50 text-green-700"
                            : job.status === "Pending"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-orange-50 text-orange-700"
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{job.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 KaamFlow. Repair Operations & Outcome Intelligence.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
