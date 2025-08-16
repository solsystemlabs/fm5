import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { ProfileInfoForm } from '@/components/profile/ProfileInfoForm';

export const Route = createFileRoute('/_authenticated/profile/')({
  component: ProfileOverview,
});

function ProfileOverview() {
  console.log('ProfileOverview rendering...');
  
  // Get the parent route's context and loader data
  const parentContext = useRouteContext({ from: '/_authenticated/profile' });
  const parentRoute = Route.getParentRoute();
  const loaderData = parentRoute.useLoaderData();
  
  console.log('Parent context:', parentContext);
  console.log('Parent loader data:', loaderData);
  
  // The user profile data should be in the loader data
  if (loaderData && loaderData.userProfile) {
    return (
      <ProfileInfoForm
        userProfile={loaderData.userProfile}
        onUpdate={(updatedProfile) => {
          console.log('Profile updated:', updatedProfile);
          // We'll implement the update logic later
        }}
      />
    );
  }
  
  // If no loader data, the user info might be in the context
  if (parentContext && parentContext.user) {
    // Transform context user to match expected profile structure
    const userProfile = {
      ...parentContext.user,
      profile: {
        bio: parentContext.user.bio || '',
        profileViews: 0, // Default value
      },
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        profileVisibility: 'public'
      }
    };
    
    return (
      <ProfileInfoForm
        userProfile={userProfile}
        onUpdate={(updatedProfile) => {
          console.log('Profile updated:', updatedProfile);
        }}
      />
    );
  }
  
  return <div>No profile data available</div>;
}