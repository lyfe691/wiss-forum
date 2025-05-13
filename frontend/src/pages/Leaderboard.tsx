import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '@/lib/api';
import { getAvatarUrl, getRoleBadgeColor, formatRoleName } from '@/lib/utils';
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
import { Trophy, Heart, Users, Medal } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

interface LeaderboardUser {
  userId: string;
  username: string;
  displayName?: string;
  role: string;
  avatar?: string;
  totalLikes: number;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await usersAPI.getUserLeaderboard();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Get initials for avatar fallback
  const getInitials = (name: string = 'User') => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-700';
      default:
        return 'text-slate-500';
    }
  };

  // Get medal icon based on rank
  const getMedalIcon = (rank: number) => {
    return rank <= 3 ? (
      <Trophy className={`h-5 w-5 ${getMedalColor(rank)}`} />
    ) : (
      <span className="text-slate-500 font-mono">{rank}</span>
    );
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
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

      <div className="flex items-center gap-3 mb-6">
        <Medal className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            Users ranked by likes received on their posts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Top Contributors</span>
          </CardTitle>
          <CardDescription>
            Users who have received the most likes on their posts and replies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </div>
                ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No data yet</h3>
              <p className="text-muted-foreground">
                There are no likes given yet or no users to display
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium text-center">
                      <div className="flex justify-center">{getMedalIcon(index + 1)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-primary/10">
                          <AvatarImage
                            src={getAvatarUrl(user.username, user.avatar)}
                            alt={user.displayName || user.username}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.displayName || user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            to={`/users/${user.username}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {user.displayName || user.username}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={`px-1.5 py-0.5 text-xs font-normal ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {formatRoleName(user.role)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Heart
                          className={`h-4 w-4 ${
                            index < 3 ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            index < 3 ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {user.totalLikes}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 