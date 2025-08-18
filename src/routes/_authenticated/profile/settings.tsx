import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { SettingsForm } from '@/components/profile/SettingsForm';
import { useProfileContext } from '../profile';

export const Route = createFileRoute('/_authenticated/profile/settings')({
  component: ProfileSettings,
});

function ProfileSettings() {
  const { userProfile, setUserProfile } = useProfileContext();
  
  return (
    <SettingsForm
      userProfile={userProfile}
      onUpdate={(updatedSettings) => {
        console.log('Settings updated:', updatedSettings);
        setUserProfile(prevProfile => prevProfile ? { ...prevProfile, ...updatedSettings } : null);
      }}
    />
  );
}