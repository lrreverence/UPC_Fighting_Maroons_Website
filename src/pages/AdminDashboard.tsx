import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AthletesList from '../components/AthletesList';
import AddAthleteForm from '../components/AddAthleteForm';
import AdminScheduleSection from '../components/admin/AdminScheduleSection';
import AdminNewsSection from '../components/admin/AdminNewsSection';
import AdminStatsSection from '../components/admin/AdminStatsSection';
import AchievementsSection from '../components/AchievementsSection';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('athletes');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'athletes':
        return (
          <div className="space-y-6">
            <AddAthleteForm />
            <AthletesList />
          </div>
        );
      case 'schedule':
        return <AdminScheduleSection />;
      case 'news':
        return <AdminNewsSection />;
      case 'stats':
        return <AdminStatsSection />;
      case 'achievements':
        return <AchievementsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <div className="ml-6 flex space-x-4">
                <button
                  onClick={() => setActiveSection('athletes')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === 'athletes'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Athletes
                </button>
                <button
                  onClick={() => setActiveSection('schedule')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === 'schedule'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Schedule
                </button>
                <button
                  onClick={() => setActiveSection('news')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === 'news'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  News
                </button>
                <button
                  onClick={() => setActiveSection('stats')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === 'stats'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Stats
                </button>
                <button
                  onClick={() => setActiveSection('achievements')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === 'achievements'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Achievements
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderSection()}
        </div>
      </main>
    </div>
  );
} 