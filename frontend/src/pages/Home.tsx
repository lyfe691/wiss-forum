import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { categoriesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Users, BookOpen } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  subcategories?: Category[];
}

export function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/80 to-primary rounded-lg p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to WISS Forum</h1>
          <p className="text-lg mb-6">
            A community platform for students and teachers to discuss, learn and collaborate.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/categories">
                <Button size="lg" variant="secondary">
                  Browse Categories
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" variant="secondary">
                    Join the Community
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="bg-white/10 text-white border-white">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Discuss various topics organized by categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100+</div>
            <p className="text-xs text-muted-foreground">
              Students and teachers engaged in discussions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50+</div>
            <p className="text-xs text-muted-foreground">
              Educational topics to enhance your learning
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Featured Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Categories</h2>
            <p className="text-muted-foreground">Explore popular discussion categories</p>
          </div>
          <Link to="/categories">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
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
              <Card key={category._id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                {category.subcategories && category.subcategories.length > 0 && (
                  <CardContent className="pb-2">
                    <ScrollArea className="h-28">
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Subcategories</h3>
                        {category.subcategories.map((sub) => (
                          <div key={sub._id}>
                            <Link 
                              to={`/categories/${sub.slug}`}
                              className="text-sm hover:underline"
                            >
                              {sub.name}
                            </Link>
                            <Separator className="my-2" />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                )}
                <CardFooter>
                  <Link to={`/categories/${category.slug}`} className="w-full">
                    <Button variant="secondary" className="w-full">
                      Browse Topics
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="bg-muted p-8 text-center rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Join our Academic Community Today</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Connect with fellow students and teachers, participate in discussions, and enhance your learning experience.
          </p>
          <Link to="/register">
            <Button size="lg">Sign Up Now</Button>
          </Link>
        </section>
      )}
    </div>
  );
} 