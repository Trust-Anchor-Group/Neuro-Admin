import SessionPing from "@/components/SessionPing";

export default function DashboardLayout({ children }) {
  return (
    <>
      <SessionPing />
      {children}
    </>
  );
}
