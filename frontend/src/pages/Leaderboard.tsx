import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '@/lib/api';
import { getAvatarUrl, formatRoleName, getInitials, getRoleBadgeColor } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Heart, 
  Flame,
  MessageSquare,
  FileText,
  Crown,
  Star,
  TrendingUp
} from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: string;
  totalScore: number;
  level: number;
  topicsCreated: number;
  postsCreated: number;
  likesReceived: number;
  currentStreak: number;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await usersAPI.getUserLeaderboard('enhanced');
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getLevelBadge = (level: number) => {
    if (level >= 8) return '💎';
    if (level >= 5) return '🏆';
    if (level >= 3) return '🥉';
    return '🌱';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-4 w-4 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return 'text-purple-500';
    if (level >= 5) return 'text-blue-500';
    if (level >= 3) return 'text-green-500';
    return 'text-gray-500';
  };

  const sortedUsers = {
    overall: [...users].sort((a, b) => b.totalScore - a.totalScore),
    active: [...users].sort((a, b) => (b.topicsCreated + b.postsCreated) - (a.topicsCreated + a.postsCreated))
  };

  const renderLeaderboardTable = (usersList: LeaderboardUser[], type: 'overall' | 'active') => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-center">Level</TableHead>
          {type === 'overall' && <TableHead className="text-center">Score</TableHead>}
          {type === 'active' && <TableHead className="text-center">Activity</TableHead>}
          <TableHead className="text-right">Stats</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usersList.slice(0, 15).map((user, index) => (
          <TableRow key={user._id} className="hover:bg-muted/50">
            <TableCell className="text-center">
              {getRankIcon(index + 1)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl(user._id, user.avatar)} alt={user.displayName || user.username} />
                  <AvatarFallback className="text-xs">{getInitials(user.displayName || user.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    to={`/users/${user.username}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {user.displayName || user.username}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs px-1 py-0 ${getRoleBadgeColor(user.role)}`}>
                      {formatRoleName(user.role)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg">{getLevelBadge(user.level)}</span>
                <span className={`font-semibold ${getLevelColor(user.level)}`}>
                  {user.level}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              {type === 'overall' && (
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="font-bold">{user.totalScore.toLocaleString()}</span>
                </div>
              )}
              {type === 'active' && (
                <div className="text-sm">
                  <div className="font-medium">{user.topicsCreated + user.postsCreated}</div>
                  <div className="text-xs text-muted-foreground">posts</div>
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-blue-500" />
                  <span>{user.topicsCreated}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-green-500" />
                  <span>{user.postsCreated}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span>{user.likesReceived}</span>
                </div>
                {user.currentStreak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span>{user.currentStreak}</span>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium text-foreground">
                Leaderboard
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">
            Celebrating our most active community members
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="w-8 h-4" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="font-medium text-foreground">
              Leaderboard
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">
          Celebrating our most active community members
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overall" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overall
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Most Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Contributors
              </CardTitle>
              <CardDescription>
                Ranked by total community points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaderboardTable(sortedUsers.overall, 'overall')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Most Active Members
              </CardTitle>
              <CardDescription>
                Ranked by topics created and posts written
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaderboardTable(sortedUsers.active, 'active')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {users.length === 0 && (
        <Card className="p-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground">
            Start participating in discussions to see the leaderboard!
          </p>
        </Card>
      )}
    </div>
  );
} 