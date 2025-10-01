import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { Header } from './components/Layout/Header';
import { HomeView } from './views/HomeView';
import { RecommendationsView } from './views/RecommendationsView';
import { BrowseView } from './views/BrowseView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { ResourceDetail } from './components/Resources/ResourceDetail';
import { mockResources, generateMockProfile } from './utils/mockData';
import { Resource, StartupProfile, UserInteraction, UserPreferences } from './types';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('home');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [resources] = useState<Resource[]>(mockResources);

  useEffect(() => {
    if (user) {
      const storedProfile = localStorage.getItem(`profile_${user.id}`);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        setProfile(generateMockProfile(user.id));
      }

      const storedPreferences = localStorage.getItem(`preferences_${user.id}`);
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      } else {
        setPreferences({
          id: 'pref-1',
          user_id: user.id,
          preferred_industries: [],
          preferred_content_types: [],
          preferred_difficulty: 'intermediate',
          excluded_tags: [],
          notification_frequency: 'weekly',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      const storedInteractions = localStorage.getItem(`interactions_${user.id}`);
      if (storedInteractions) {
        setInteractions(JSON.parse(storedInteractions));
      }
    }
  }, [user]);

  const handleSaveProfile = async (updatedProfile: Partial<StartupProfile>) => {
    if (!user) return;

    const newProfile: StartupProfile = {
      ...(profile || generateMockProfile(user.id)),
      ...updatedProfile,
      updated_at: new Date().toISOString()
    };

    setProfile(newProfile);
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(newProfile));
  };

  const handleSavePreferences = async (updatedPreferences: Partial<UserPreferences>) => {
    if (!user || !preferences) return;

    const newPreferences: UserPreferences = {
      ...preferences,
      ...updatedPreferences,
      updated_at: new Date().toISOString()
    };

    setPreferences(newPreferences);
    localStorage.setItem(`preferences_${user.id}`, JSON.stringify(newPreferences));
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    trackInteraction(resource.id, 'view');
  };

  const trackInteraction = (resourceId: string, type: string, data?: any) => {
    if (!user) return;

    const interaction: UserInteraction = {
      id: `int-${Date.now()}`,
      user_id: user.id,
      resource_id: resourceId,
      interaction_type: type as any,
      time_spent: data?.time_spent || 0,
      rating: data?.rating,
      context_data: data || {},
      created_at: new Date().toISOString()
    };

    const updated = [...interactions, interaction];
    setInteractions(updated);
    localStorage.setItem(`interactions_${user.id}`, JSON.stringify(updated));
  };

  const handleRate = (rating: number) => {
    if (selectedResource) {
      trackInteraction(selectedResource.id, 'rate', { rating });
    }
  };

  const handleBookmark = () => {
    if (selectedResource) {
      trackInteraction(selectedResource.id, 'bookmark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm onToggle={() => setAuthMode('signup')} />
        ) : (
          <SignupForm onToggle={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <HomeView
            resources={resources}
            onResourceClick={handleResourceClick}
          />
        )}

        {currentView === 'recommendations' && (
          <RecommendationsView
            resources={resources}
            profile={profile}
            interactions={interactions}
            onResourceClick={handleResourceClick}
          />
        )}

        {currentView === 'resources' && (
          <BrowseView
            resources={resources}
            onResourceClick={handleResourceClick}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            profile={profile}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            preferences={preferences}
            onSave={handleSavePreferences}
          />
        )}
      </main>

      {selectedResource && (
        <ResourceDetail
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onRate={handleRate}
          onBookmark={handleBookmark}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
