import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Home, Compass, Settings, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onViewChange('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Compass className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Visey</span>
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onViewChange('home')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </button>
            <button
              onClick={() => onViewChange('recommendations')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'recommendations'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Compass className="w-4 h-4 inline mr-2" />
              Recommendations
            </button>
            <button
              onClick={() => onViewChange('resources')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'resources'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Browse
            </button>
            <button
              onClick={() => onViewChange('profile')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => onViewChange('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              {user?.email}
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
