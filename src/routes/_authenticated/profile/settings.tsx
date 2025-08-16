import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { SettingsForm } from '@/components/profile/SettingsForm';

export const Route = createFileRoute('/_authenticated/profile/settings')({
  component: ProfileSettings,
});

function ProfileSettings() {
  const parentContext = useRouteContext({ from: '/_authenticated/profile' });
  const parentRoute = Route.getParentRoute();
  const loaderData = parentRoute.useLoaderData();
  
  // Use loader data if available, otherwise fall back to context user
  let userProfile;
  
  if (loaderData && loaderData.userProfile) {
    userProfile = loaderData.userProfile;
  } else if (parentContext && parentContext.user) {
    userProfile = {
      ...parentContext.user,
      profile: {
        bio: parentContext.user.bio || '',
        profileViews: 0,
      },
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        profileVisibility: 'public'
      }
    };
  }
  
  if (!userProfile) {
    return <div>No profile data available</div>;
  }

  return (
    <SettingsForm
      userProfile={userProfile}
      onUpdate={(updatedSettings) => {
        console.log('Settings updated:', updatedSettings);
        // We'll implement the update logic later
      }}
    />
  );
}