import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { ActivityHistory } from '@/components/profile/ActivityHistory';

export const Route = createFileRoute('/_authenticated/profile/activity')({
  component: ProfileActivity,
});

function ProfileActivity() {
  const parentContext = useRouteContext({ from: '/_authenticated/profile' });
  const parentRoute = Route.getParentRoute();
  const loaderData = parentRoute.useLoaderData();
  
  // Use loader data if available, otherwise fall back to context user
  let userProfile;
  
  if (loaderData && loaderData.userProfile) {
    userProfile = loaderData.userProfile;
  } else if (parentContext && parentContext.user) {
    userProfile = parentContext.user;
  }
  
  if (!userProfile || !userProfile.id) {
    return <div>No profile data available</div>;
  }

  return <ActivityHistory userId={userProfile.id} />;
}