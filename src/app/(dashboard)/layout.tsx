import ProtectedRoute from "@/components/protectedRoute";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default DashboardLayout;
