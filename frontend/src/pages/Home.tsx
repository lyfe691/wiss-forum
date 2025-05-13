import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { categoriesAPI, statsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Users, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  School, 
  GraduationCap, 
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
    <div className="space-y-12 mx-auto px-0 sm:px-2 py-4">
      {/* Hero Section - Redesigned */}
      <section className="relative -mt-4 pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        
        <div className="absolute top-0 right-0 -mt-40 -mr-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl opacity-70" />
        <div className="absolute bottom-0 left-0 -mb-40 -ml-40 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl opacity-70" />
        
        <div className="absolute right-10 top-20 animate-float-slow">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 rotate-12 flex items-center justify-center text-primary">
            <BookOpen className="w-10 h-10" />
          </div>
        </div>
        
        <div className="absolute left-10 bottom-20 animate-float">
          <div className="w-16 h-16 rounded-full bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 flex items-center justify-center text-violet-500">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-3 space-y-6">
              <Badge variant="secondary" className="px-4 py-1.5 text-md font-medium bg-primary/10 text-primary border-primary/20 rounded-full">
                <School className="h-4 w-4 mr-2" />
                Learning Community
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold !leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                Welcome to WISS Forum
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Join our knowledge-sharing platform where students and teachers connect, collaborate, and grow together in an interactive learning environment.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
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
              
              <div className="flex items-center pt-4 text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">Join {stats.userCount} members already discussing academic topics</span>
              </div>
            </div>
            
            <div className="lg:col-span-2 order-first lg:order-last flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-3xl opacity-50 scale-150" />
                <div className="relative bg-gradient-to-br from-card/80 to-background/80 backdrop-blur-sm rounded-3xl p-6 border border-border/50 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div className="ml-auto text-sm text-muted-foreground">WISS Forum</div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user ? getAvatarUrl(user.username) : getAvatarUrl("student")} alt="User" />
                          <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">Welcome{user ? `, ${user.displayName}` : ""}!</span>
                          <span className="text-xs text-muted-foreground">Let's explore topics today</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Active Categories</span>
                        <Badge variant="outline">{stats.categoryCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Topics Available</span>
                        <Badge variant="outline">{stats.topicCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
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

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {isLoading ? (
                  <Skeleton className="h-9 w-16 rounded-md" />
                ) : (
                  stats.categoryCount
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Discuss various topics organized by categories
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Members</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {isLoading ? (
                  <Skeleton className="h-9 w-16 rounded-md" />
                ) : (
                  stats.userCount !== undefined ? stats.userCount : 'N/A'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Students and teachers engaged in discussions
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics Created</CardTitle>
              <BookOpen className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {isLoading ? (
                  <Skeleton className="h-9 w-16 rounded-md" />
                ) : (
                  stats.topicCount !== undefined ? stats.topicCount : 'N/A'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Educational topics to enhance your learning
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Categories</h2>
            <p className="text-muted-foreground">Explore popular discussion categories</p>
          </div>
          <Link to="/categories">
            <Button variant="outline" className="group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="border shadow-sm overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category) => (
              <div key={category._id}>
                <Card className="h-full flex flex-col border hover:border-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <span className="mr-2 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                      {category.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                  </CardHeader>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <CardContent className="pb-2 flex-grow">
                      <ScrollArea className="h-28">
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground">Subcategories</h3>
                          {category.subcategories.map((sub) => (
                            <div key={sub._id}>
                              <Link 
                                to={`/categories/${sub.slug}`}
                                className="text-sm hover:text-primary transition-colors flex items-center"
                              >
                                <ArrowRight className="h-3 w-3 mr-1.5 text-muted-foreground" />
                                {sub.name}
                              </Link>
                              <Separator className="my-2" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  )}
                  <CardFooter className="mt-auto pt-4">
                    <Link to={`/categories/${category.slug}`} className="w-full">
                      <Button variant="secondary" className="w-full group">
                        Browse Topics
                        <ArrowRight className="ml-1.5 h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="relative bg-gradient-to-r from-muted/80 via-muted to-muted/90 p-8 md:p-12 text-center rounded-xl overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-grid-black/[0.2] bg-grid-8" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join our Academic Community Today</h2>
            <p className="mb-8 max-w-2xl mx-auto text-muted-foreground">
              Connect with {stats.userCount > 0 ? 
                stats.userCount : 
                (isLoading ? '...' : 'other')
              } students and teachers, 
              participate in discussions, and enhance your learning experience.
            </p>
            <Link to="/register">
              <Button size="lg" className="group">
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
} 