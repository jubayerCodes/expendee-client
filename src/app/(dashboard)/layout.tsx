import ProtectedRoute from "@/components/protectedRoute";
import { Sidebar } from "@/components/Sidebar";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <Sidebar />
        {children}
      </div>
    </ProtectedRoute>
  );
}

export default DashboardLayout;
