import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { categoriesAPI, statsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Users, 
  BookOpen, 
  ArrowRight, 
  ChevronRight, 
  School,
  Clock 
} from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';

interface Category {
  _id: string;
  id?: string;
  name: string;
  description: string;
  slug: string;
  subcategories?: Category[];
}

interface Stats {
  userCount: number;
  categoryCount: number;
  topicCount: number;
  postCount: number;
}

export function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    userCount: 0,
    categoryCount: 0,
    topicCount: 0,
    postCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch both categories and stats concurrently
        const [categoriesData, statsData] = await Promise.all([
          categoriesAPI.getAllCategories(),
          statsAPI.getStats()
        ]);
        
        setCategories(categoriesData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 mx-auto px-0 sm:px-2 py-4">
      {/* Hero Section */}
      <section className="relative pt-10 pb-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/8 to-violet-500/5" />
          <div className="absolute top-0 right-0 -mt-20 -mr-20 lg:-mt-40 lg:-mr-40 w-64 h-64 lg:w-96 lg:h-96 rounded-full bg-primary/20 blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 lg:-mb-40 lg:-ml-40 w-64 h-64 lg:w-96 lg:h-96 rounded-full bg-violet-500/20 blur-3xl opacity-60" />
          <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl opacity-50" />
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-500/10 blur-3xl opacity-50" />
        </div>
        
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(to right, 
              rgb(var(--background) / 1) 0%, 
              rgb(var(--background) / 0.1) 10%, 
              rgb(var(--background) / 0) 20%,
              rgb(var(--background) / 0) 80%,
              rgb(var(--background) / 0.1) 90%,
              rgb(var(--background) / 1) 100%
            ),
            linear-gradient(to bottom, 
              rgb(var(--background) / 1) 0%, 
              rgb(var(--background) / 0.1) 5%, 
              rgb(var(--background) / 0) 15%,
              rgb(var(--background) / 0) 85%,
              rgb(var(--background) / 0.1) 95%,
              rgb(var(--background) / 1) 100%
            )
          `,
          pointerEvents: 'none',
          zIndex: 5
        }} />
        
        <div className="absolute right-10 top-20 animate-float-slow hidden md:block z-10">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 rotate-12 flex items-center justify-center text-primary">
            <BookOpen className="w-8 h-8 lg:w-10 lg:h-10" />
          </div>
        </div>
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-5 md:space-y-6 text-center lg:text-left">
              <Badge variant="secondary" className="px-3 py-1 md:px-4 md:py-1.5 text-sm md:text-md font-medium bg-primary/10 text-primary border-primary/20 rounded-full inline-flex items-center">
                <School className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                Learning Community
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold !leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                  WISS Forum
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                {isAuthenticated ? (
                  <>Welcome back! Explore the latest discussions and engage with your fellow community members.</>
                ) : (
                  <>Join our knowledge-sharing platform where students and teachers connect, collaborate, and grow together in an interactive learning environment.</>
                )}
              </p>
              
              <div className="flex flex-wrap gap-3 md:gap-4 pt-2 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <Link to="/categories">
                    <Button size="lg" className="rounded-full font-medium">
                      Browse Categories
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="rounded-full font-medium">
                        Join the Community
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="lg" variant="outline" className="rounded-full font-medium">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              
              <div className="flex items-center pt-2 md:pt-4 text-muted-foreground justify-center lg:justify-start">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                <span className="text-xs md:text-sm">Join {stats.userCount} members already discussing academic topics</span>
              </div>
            </div>
            
            <div className="order-first lg:order-last flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-3xl opacity-50 scale-150" />
                <div className="relative bg-gradient-to-br from-card/80 to-background/80 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-border/50 shadow-xl">
                  <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-red-500" />
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-yellow-500" />
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-500" />
                    <div className="ml-auto text-xs md:text-sm text-muted-foreground">WISS Forum</div>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div className="px-3 py-2 md:px-4 md:py-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Avatar className="h-8 w-8 md:h-10 md:w-10">
                          <AvatarImage src={user ? getAvatarUrl(user._id, user.avatar) : getAvatarUrl("student")} alt="User" />
                          <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base font-medium">Welcome{user ? `, ${user.displayName}` : ""}!</span>
                          <span className="text-xs text-muted-foreground">Let's explore topics today</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Active Categories</span>
                        <Badge variant="outline">{stats.categoryCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Topics Available</span>
                        <Badge variant="outline">{stats.topicCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Community Size</span>
                        <Badge variant="outline">{stats.userCount} members</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 hover:border-primary/30 transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Categories</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded" />
              ) : (
                stats.categoryCount
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Organized discussion topics
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 hover:border-primary/30 transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Community Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded" />
              ) : (
                stats.userCount
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Students and teachers
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 hover:border-primary/30 transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Topics Created</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded" />
              ) : (
                stats.topicCount
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Educational discussions
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Clean Featured Categories */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Categories</h2>
            <p className="text-muted-foreground">Explore popular discussion categories</p>
          </div>
          <Link to="/categories">
            <Button variant="outline" className="group">
              View All
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="h-40">
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category) => (
              <Link key={category._id} to={`/categories/${category.slug}`}>
                <Card className="h-full group border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Browse topics</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="relative bg-muted/50 p-8 md:p-12 text-center rounded-xl border border-border/50">
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join our Academic Community</h2>
            <p className="mb-8 max-w-2xl mx-auto text-muted-foreground">
              Connect with {stats.userCount > 0 ? stats.userCount : '...'} students and teachers, 
              participate in discussions, and enhance your learning experience.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="group">
                  Sign Up Now
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 