import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Flame, 
  Target, 
  Award, 
  FileText,
  MessageSquare,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usersAPI } from '@/lib/api';

interface GamificationStats {
  totalScore: number;
  level: number;
  topicsCreated: number;
  postsCreated: number;
  likesReceived: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  achievements: string[];
  levelProgress: number;
  pointsToNextLevel: number;
}

interface UserGamificationWidgetProps {
  showTitle?: boolean;
  compact?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  username?: string;
}

export function UserGamificationWidget({ 
  showTitle = true, 
  compact = false, 
  collapsible = false,
  defaultCollapsed = false,
  username
}: UserGamificationWidgetProps) {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let data;
        if (username) {
          // Fetch public stats for specific user
          console.log(`UserGamificationWidget: Fetching public stats for username: ${username}`);
          data = await usersAPI.getPublicUserGamificationStats(username);
          console.log(`UserGamificationWidget: Received data for ${username}:`, data);
        } else {
          // Fetch current user's stats (requires authentication)
          console.log('UserGamificationWidget: Fetching current user stats');
          data = await usersAPI.getUserGamificationStats();
          console.log('UserGamificationWidget: Received current user data:', data);
        }
        setStats(data);
      } catch (error) {
        console.error('Error fetching gamification stats:', error);
        console.error('Username provided:', username);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [username]);

  const getLevelColor = (level: number) => {
    if (level >= 8) return 'text-purple-500';
    if (level >= 5) return 'text-blue-500';
    if (level >= 3) return 'text-green-500';
    return 'text-gray-500';
  };

  const getLevelBadge = (level: number) => {
    if (level >= 8) return '💎';
    if (level >= 5) return '🏆';
    if (level >= 3) return '🥉';
    return '🌱';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Stats not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{getLevelBadge(stats.level)}</span>
              <div>
                <div className={`font-semibold ${getLevelColor(stats.level)}`}>
                  Level {stats.level}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalScore} points
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-blue-500" />
                <span>{stats.topicsCreated}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-green-500" />
                <span>{stats.postsCreated}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                <span>{stats.likesReceived}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Community Stats
              </CardTitle>
              <CardDescription>
                Activity and progress overview
              </CardDescription>
            </div>
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      {(!collapsible || !isCollapsed) && (
        <CardContent className="space-y-4">
          {/* Level and Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getLevelBadge(stats.level)}</span>
              <div>
                <div className={`text-lg font-bold ${getLevelColor(stats.level)}`}>
                  Level {stats.level}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.totalScore.toLocaleString()} points
                </div>
              </div>
            </div>
            
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <Flame className="h-4 w-4" />
                <span className="font-medium">{stats.currentStreak} day streak</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {stats.pointsToNextLevel > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {stats.level + 1}</span>
                <span>{Math.round(stats.levelProgress * 100)}%</span>
              </div>
              <Progress value={stats.levelProgress * 100} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {stats.pointsToNextLevel} points to next level
              </div>
            </div>
          )}

          {/* Activity Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-medium">{stats.topicsCreated}</div>
                <div className="text-xs text-muted-foreground">Topics Created</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-medium">{stats.postsCreated}</div>
                <div className="text-xs text-muted-foreground">Posts Written</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <Heart className="h-4 w-4 text-red-500" />
              <div>
                <div className="font-medium">{stats.likesReceived}</div>
                <div className="text-xs text-muted-foreground">Likes Received</div>
              </div>
            </div>
            

          </div>

          {/* Recent Achievements (only show if any exist) */}
          {stats.achievements.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Latest Achievement</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <Award className="h-3 w-3 text-yellow-500" />
                <span className="text-sm">
                  {stats.achievements[stats.achievements.length - 1].replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
} 