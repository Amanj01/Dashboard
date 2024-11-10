import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex overflow-hidden">
      <Sidebar />
      <div className="flex-grow p-4">{children}</div>
    </div>
  );
}
