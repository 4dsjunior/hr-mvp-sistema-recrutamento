// 🚨 CORREÇÃO: Layout.tsx - Componente que aceita children
// Arquivo: frontend/src/components/Layout/Layout.tsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">
                Sistema HR
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Bem-vindo ao sistema
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Se children for passado, usar children, senão usar Outlet */}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;