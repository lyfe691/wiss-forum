import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { statsAPI } from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { 
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  Crown,
  ShieldAlert,
  ArrowLeft,
  Activity,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { Role, roleUtils } from '@/lib/types';
import { getAvatarUrl, getInitials } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCategories: number;
    totalTopics: number;
    totalPosts: number;
    totalLikes: number;
  };
  registrations: { month: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  topPerformers: any[];
  activityData: { month: string; registrations: number; topics: number; posts: number }[];
}

const chartConfig = {
  registrations: {
    label: "Registrations",
    color: "hsl(var(--chart-1))",
  },
  topics: {
    label: "Topics",
    color: "hsl(var(--chart-2))",
  },
  posts: {
    label: "Posts",
    color: "hsl(var(--chart-3))",
  },
  STUDENT: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
  TEACHER: {
    label: "Teachers",
    color: "hsl(var(--chart-2))",
  },
  ADMIN: {
    label: "Admins",
    color: "hsl(var(--chart-3))",
  },
};

const ROLE_COLORS = {
  STUDENT: "#3b82f6",
  TEACHER: "#10b981",
  ADMIN: "#f59e0b",
};

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const data = await statsAPI.getAnalyticsData();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const userRole = roleUtils.normalizeRole(user?.role);
    if (userRole === Role.ADMIN) {
      fetchAnalyticsData();
    }
  }, [user]);

  const userRole = user ? roleUtils.normalizeRole(user.role) : null;
  const isAdmin = userRole === Role.ADMIN;

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShieldAlert className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <p>This area is restricted to administrators only.</p>
          </CardContent>
          <div className="flex justify-center pt-6">
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your forum's performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/users">Manage Users</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/categories">Manage Categories</Link>
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-blue-500" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="mr-2 h-4 w-4 text-green-500" />
              Total Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.totalTopics || 0}</div>
            <p className="text-xs text-muted-foreground">Discussion topics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">Forum posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="mr-2 h-4 w-4 text-orange-500" />
              Total Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.totalLikes || 0}</div>
            <p className="text-xs text-muted-foreground">Community engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4 text-red-500" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.totalCategories || 0}</div>
            <p className="text-xs text-muted-foreground">Discussion categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
        {/* Activity Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Activity Over Time
            </CardTitle>
            <CardDescription>
              User registrations, topics, and posts over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={analyticsData?.activityData || []}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="registrations" fill="var(--color-registrations)" radius={4} />
                <Bar dataKey="topics" fill="var(--color-topics)" radius={4} />
                <Bar dataKey="posts" fill="var(--color-posts)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="mr-2 h-5 w-5" />
              User Role Distribution
            </CardTitle>
            <CardDescription>
              Distribution of user roles across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={analyticsData?.roleDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({role, count, percent}) => `${role}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData?.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role as keyof typeof ROLE_COLORS] || "#8884d8"} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Most active community members based on engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {analyticsData?.topPerformers.slice(0, 5).map((performer, index) => (
              <div key={performer.username} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                                     <Link to={`/users/${performer.username}`}>
                     <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                       <AvatarImage src={getAvatarUrl(performer._id, performer.avatar)} alt={performer.displayName || performer.username} />
                       <AvatarFallback className="bg-primary/10 text-primary">
                         {getInitials(performer.displayName || performer.username)}
                       </AvatarFallback>
                     </Avatar>
                   </Link>
                    <div>
                     <Link 
                       to={`/users/${performer.username}`}
                       className="font-medium hover:text-primary transition-colors"
                     >
                       {performer.displayName}
                     </Link>
                     <p className="text-sm text-muted-foreground">@{performer.username}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{performer.totalScore}</div>
                    <div className="text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{performer.topicsCreated}</div>
                    <div className="text-muted-foreground">Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{performer.postsCreated}</div>
                    <div className="text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{performer.likesReceived}</div>
                    <div className="text-muted-foreground">Likes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 