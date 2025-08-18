import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { ProfileInfoForm } from '@/components/profile/ProfileInfoForm';
import { useProfileContext } from '../profile';

export const Route = createFileRoute('/_authenticated/profile/')({
  component: ProfileOverview,
});

function ProfileOverview() {
  console.log('ProfileOverview rendering...');
  
  // Get the profile data from the context provided by the parent layout
  const { userProfile, setUserProfile } = useProfileContext();
  
  return (
    <ProfileInfoForm
      userProfile={userProfile}
      onUpdate={(updatedProfile) => {
        console.log('Profile updated:', updatedProfile);
        setUserProfile(prevProfile => prevProfile ? { ...prevProfile, ...updatedProfile } : null);
      }}
    />
  );
}