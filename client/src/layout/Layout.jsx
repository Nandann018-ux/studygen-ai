import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
export default function Layout() {
  return (
    <div className="flex flex-col h-screen min-h-screen bg-[#f8f9fc] text-text-main font-sans overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="hidden lg:block w-64 flex-shrink-0 border-r border-[#e8e9ef] bg-white h-full" />
        <main className="flex-1 overflow-y-auto w-full p-10 bg-surface-bg relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
