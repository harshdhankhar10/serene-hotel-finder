
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AiAssistantChip from "./AiAssistantChip";

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <AiAssistantChip />
    </div>
  );
};

export default Layout;
