import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen min-h-screen bg-surface-bg text-text-main font-sans overflow-hidden">
      <Sidebar className="hidden lg:flex w-[260px] flex-shrink-0 border-r border-surface-border bg-surface-sidebar h-full z-10" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto w-full p-10 bg-surface-bg relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
