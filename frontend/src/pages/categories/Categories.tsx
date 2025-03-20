import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageSquare, FolderTree } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategories?: Category[];
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter top-level categories (those without a parent)
  const topLevelCategories = categories.filter(category => !category.parent);
  
  // Filter all categories based on search query
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageBreadcrumb items={[
        { label: 'Categories', isCurrentPage: true }
      ]} />
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Categories</h1>
          <p className="text-muted-foreground">Browse all discussion categories</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin/categories">
              <Button variant="default">
                Manage Categories
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs defaultValue="hierarchical" className="w-full">
        <TabsList className="grid w-full md:w-80 grid-cols-2">
          <TabsTrigger value="hierarchical">
            <FolderTree className="h-4 w-4 mr-2" />
            Hierarchical
          </TabsTrigger>
          <TabsTrigger value="list">
            <MessageSquare className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
        </TabsList>
        
        {/* Hierarchical View */}
        <TabsContent value="hierarchical" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(3)].map((_, subIndex) => (
                        <Skeleton key={subIndex} className="h-12 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {topLevelCategories.map((category) => (
                <Card key={category._id}>
                  <CardHeader>
                    <CardTitle>
                      <Link to={`/categories/${category.slug}`} className="hover:underline">
                        {category.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.subcategories.map((subcategory) => (
                          <Link 
                            key={subcategory._id} 
                            to={`/categories/${subcategory.slug}`}
                            className="block p-3 rounded-md border hover:bg-muted transition-colors"
                          >
                            <h3 className="font-medium">{subcategory.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {subcategory.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  )}
                  <CardFooter>
                    <Link to={`/categories/${category.slug}`} className="w-full">
                      <Button variant="secondary" className="w-full">
                        View Topics
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* List View */}
        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40 mb-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(8)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : searchQuery ? (
            // Show search results when search query exists
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Showing {filteredCategories.length} {filteredCategories.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No categories found matching your search.
                  </div>
                ) : (
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                      {filteredCategories.map((category) => (
                        <Link 
                          key={category._id} 
                          to={`/categories/${category.slug}`}
                          className="block p-4 rounded-md border hover:bg-muted transition-colors"
                        >
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                          {category.parent && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Parent: {category.parent.name}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ) : (
            // Show all categories when no search query
            <Card>
              <CardHeader>
                <CardTitle>All Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <Link 
                        key={category._id} 
                        to={`/categories/${category.slug}`}
                        className="block p-4 rounded-md border hover:bg-muted transition-colors"
                      >
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                        {category.parent && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Parent: {category.parent.name}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 