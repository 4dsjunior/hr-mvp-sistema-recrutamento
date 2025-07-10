import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  GitBranch,
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Visão geral do sistema'
    },
    {
      name: 'Candidatos',
      href: '/candidates',
      icon: Users,
      description: 'Gerenciar candidatos'
    },
    {
      name: 'Vagas',
      href: '/jobs',
      icon: Briefcase,
      description: 'Gerenciar vagas de emprego'
    },
    {
      name: 'Pipeline',
      href: '/pipeline',
      icon: GitBranch,
      description: 'Pipeline de candidaturas',
      badge: 'Novo'
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
      description: 'Relatórios e análises'
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">HR System</h1>
              <p className="text-xs text-gray-500">MVP v2.0</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                isActive ? 'text-blue-700' : 'text-gray-400'
              }`} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip para sidebar colapsada */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Status do Sistema */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-xs font-medium text-green-800">Sistema Online</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Todas as funcionalidades ativas
            </p>
          </div>
        </div>
      )}

      {/* Progress do MVP */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">Progresso MVP</span>
              <span className="text-blue-600 font-bold">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="text-xs text-gray-500">
              Pipeline implementado ✨
            </div>
          </div>
        </div>
      )}

      {/* Footer - Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && <span>Sair</span>}
          
          {/* Tooltip para logout quando colapsado */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Sair do Sistema
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;