import { StartupProfile } from '../types';
import { StartupProfileForm } from '../components/Profile/StartupProfileForm';

interface ProfileViewProps {
  profile: StartupProfile | null;
  onSaveProfile: (profile: Partial<StartupProfile>) => Promise<void>;
}

export function ProfileView({ profile, onSaveProfile }: ProfileViewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <StartupProfileForm profile={profile} onSave={onSaveProfile} />
    </div>
  );
}
