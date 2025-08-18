import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { ActivityHistory } from '@/components/profile/ActivityHistory';
import { useProfileContext } from '../profile';

export const Route = createFileRoute('/_authenticated/profile/activity')({
  component: ProfileActivity,
});

function ProfileActivity() {
  const { userProfile } = useProfileContext();
  
  return <ActivityHistory userId={userProfile.id} />;
}