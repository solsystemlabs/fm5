import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Activity, Clock, User, Settings, Shield, RefreshCw } from "lucide-react";
import type { ActivityEntry } from "@/lib/types";

interface ActivityHistoryProps {
  userId: string;
}

export function ActivityHistory({ userId }: ActivityHistoryProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/me/activity?page=${pageNum}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity history');
      }

      const data = await response.json();
      
      if (append) {
        setActivities(prev => [...prev, ...data.activities]);
      } else {
        setActivities(data.activities);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchActivities(page + 1, true);
    }
  };

  const refresh = () => {
    fetchActivities(1, false);
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'profile_update':
        return <User className="h-4 w-4" />;
      case 'security_change':
        return <Shield className="h-4 w-4" />;
      case 'settings_update':
        return <Settings className="h-4 w-4" />;
      case 'login':
      case 'logout':
        return <Activity className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'profile_update':
        return 'text-blue-600 bg-blue-50';
      case 'security_change':
        return 'text-red-600 bg-red-50';
      case 'settings_update':
        return 'text-green-600 bg-green-50';
      case 'login':
        return 'text-emerald-600 bg-emerald-50';
      case 'logout':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity History
            </CardTitle>
            <CardDescription>
              Your recent account activity and changes
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              Try Again
            </Button>
          </div>
        ) : activities.length === 0 && !loading ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">No activity history found</p>
            <p className="text-xs text-gray-400 mt-1">
              Your account activities will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    {activity.metadata && (
                      <div className="text-xs text-gray-400 ml-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Show metadata if available */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500 capitalize">
                              {key.replace('_', ' ')}:
                            </span>
                            <span className="text-gray-700 font-mono">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading state */}
            {loading && activities.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            )}

            {/* Initial loading state */}
            {loading && activities.length === 0 && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg border bg-card animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load more button */}
            {hasMore && !loading && activities.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMore}>
                  Load More Activity
                </Button>
              </div>
            )}

            {/* End of activity message */}
            {!hasMore && activities.length > 0 && (
              <div className="text-center py-4 border-t">
                <p className="text-sm text-gray-500">
                  You've reached the end of your activity history
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}