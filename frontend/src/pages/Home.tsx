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
import { MessageSquare, Users, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';

interface Category {
  _id: string;
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

  // For debugging purposes
  useEffect(() => {
    console.log("Stats updated:", stats);
  }, [stats]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Home: Starting to fetch data...");
        
        // Fetch both categories and stats concurrently
        const [categoriesData, statsData] = await Promise.all([
          categoriesAPI.getAllCategories(),
          statsAPI.getStats()
        ]);
        
        console.log("Home: Received categories:", categoriesData);
        console.log("Home: Received stats:", statsData);
        
        setCategories(categoriesData);
        setStats(statsData);
        
        console.log("Home: Updated state with new data");
      } catch (error) {
        console.error('Home: Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="space-y-8 mx-auto px-0 sm:px-2 py-4">
      {/* Breadcrumb */}
      <PageBreadcrumb items={[]} />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary/90 via-primary to-primary/80 dark:from-primary/30 dark:via-primary/25 dark:to-primary/20 rounded-2xl p-8 md:p-12 text-white shadow-xl"
      >
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5 bg-grid-8" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90 dark:to-primary/40" />
        <div className="relative max-w-3xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 border-white/30 text-white bg-white/10 backdrop-blur-sm py-1.5 px-3">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            WISS Forum - Knowledge Sharing Platform
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Welcome to WISS Forum
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
            A community platform for students and teachers to discuss, learn and collaborate on academic topics.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/categories">
                <Button size="lg" variant="secondary" className="font-medium group">
                  Browse Categories
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="font-medium group">
                    Join the Community
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-medium">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.section>

      {/* Stats Cards */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants}>
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
        </motion.div>
        
        <motion.div variants={itemVariants}>
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
        </motion.div>
        
        <motion.div variants={itemVariants}>
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
        </motion.div>
      </motion.section>

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
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.slice(0, 6).map((category) => (
              <motion.div key={category._id} variants={itemVariants}>
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative bg-gradient-to-r from-muted/80 via-muted to-muted/90 p-8 md:p-12 text-center rounded-xl overflow-hidden shadow-sm"
        >
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
        </motion.section>
      )}
    </div>
  );
} 