import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { SecurityForm } from '@/components/profile/SecurityForm';
import { useProfileContext } from '../profile';

export const Route = createFileRoute('/_authenticated/profile/security')({
  component: ProfileSecurity,
});

function ProfileSecurity() {
  const { userProfile } = useProfileContext();
  
  return <SecurityForm userProfile={userProfile} />;
}