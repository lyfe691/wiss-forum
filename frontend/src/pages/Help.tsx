import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Camera, 
  MessageSquare, 
  Users, 
  Shield,
  Flame,
  Heart
} from 'lucide-react';

export function Help() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
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
              Help Center
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold tracking-tight mb-2">WISS Forum Help Center</h1>
      <p className="text-muted-foreground mb-8">Your complete guide to using WISS Forum - from basic navigation to advanced features</p>

      <div className="grid gap-8">
        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>Welcome to WISS Forum - your academic discussion platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              WISS Forum is an interactive platform designed for WISS students and faculty to engage in 
              academic discussions, share knowledge, and build a collaborative learning community.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">🚀 Core Features:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Browse categorized discussions</li>
                  <li>• Create and reply to topics</li>
                  <li>• Gamified progression system</li>
                  <li>• User profiles with social links</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📧 Requirements:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Valid @wiss-edu.ch email</li>
                  <li>• Account registration</li>
                  <li>• Community guidelines compliance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account & Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Account & Profile Management
            </CardTitle>
            <CardDescription>Customize your profile and manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="account-1">
                <AccordionTrigger>How do I create an account?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Click "Sign up" in the top navigation</li>
                    <li>Enter your <strong>@wiss-edu.ch</strong> email address</li>
                    <li>Choose a unique username (3-20 characters, no spaces)</li>
                    <li>Create a secure password (minimum 6 characters)</li>
                    <li>Set your display name</li>
                    <li>Click "Create Account" to complete registration</li>
                  </ol>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You'll be automatically logged in and receive a unique avatar based on your user ID.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account-2">
                <AccordionTrigger>How do I update my profile?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Click your avatar/username in the top-right corner</li>
                    <li>Select "Profile" from the dropdown</li>
                    <li>Use the "Profile" tab to edit your information</li>
                    <li>Update username, display name, bio, and social links</li>
                    <li>Click "Save Changes" to apply updates</li>
                  </ol>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Profile changes are saved immediately and visible to other users.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account-3">
                <AccordionTrigger>How do I upload a profile picture?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Go to your Profile page</li>
                    <li>Click on your current profile picture (look for the camera icon)</li>
                    <li>In the modal, click the upload area or drag & drop an image</li>
                    <li>Choose an image file (JPG, PNG, GIF - max 250KB)</li>
                    <li>Your new profile picture will update everywhere instantly</li>
                  </ol>
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <strong>Important:</strong> Ensure your profile picture follows community guidelines. 
                      Inappropriate content may result in account restrictions.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="account-4">
                <AccordionTrigger>How do I add social links to my profile?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">You can add professional and social links to your profile:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>GitHub:</strong> Share your coding projects</li>
                    <li><strong>Website:</strong> Link to your personal or portfolio site</li>
                    <li><strong>LinkedIn:</strong> Professional networking profile</li>
                    <li><strong>Twitter/X:</strong> Social media presence</li>
                  </ul>
                  <p className="mt-2 text-sm text-muted-foreground">
                    These links appear on your public profile and are optional. URLs must be valid and start with http:// or https://.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Discussion Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Topics & Discussions
            </CardTitle>
            <CardDescription>Create, participate, and manage forum discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="discussion-1">
                <AccordionTrigger>How do I create a new topic?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Navigate to "Categories" in the main navigation</li>
                    <li>Select the appropriate category for your topic</li>
                    <li>Click the "New Topic" button</li>
                    <li>Enter a descriptive title and detailed content</li>
                    <li>Review your post and click "Create Topic"</li>
                  </ol>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose your category carefully - it helps other users find relevant discussions.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="discussion-2">
                <AccordionTrigger>How do I reply to topics and posts?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium">Replying to Topics:</h5>
                      <ol className="list-decimal pl-6 space-y-1 text-sm">
                        <li>Scroll to the bottom of the topic page</li>
                        <li>Use the main reply box to respond to the topic</li>
                        <li>Type your response and click "Post"</li>
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium">Replying to Specific Posts:</h5>
                      <ol className="list-decimal pl-6 space-y-1 text-sm">
                        <li>Click the "Reply" button on any post</li>
                        <li>A reply box will appear below that post</li>
                        <li>Your reply will be nested under the original post</li>
                      </ol>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="discussion-3">
                <AccordionTrigger>What is the like system?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">You can like posts to show appreciation:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Click the heart icon on any post to like it</li>
                    <li>Click again to remove your like</li>
                    <li>Likes are public and count toward gamification points</li>
                    <li>Authors receive +2 points for each like on their posts</li>
                  </ul>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use likes to encourage quality contributions and helpful answers.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="discussion-4">
                <AccordionTrigger>Can I edit or delete my posts?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p><strong>Editing:</strong> You can edit your own posts by clicking the edit button. Changes are saved immediately.</p>
                    <p><strong>Deleting:</strong> You can delete your own posts using the delete button. This action cannot be undone.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Note:</strong> Teachers and admins can moderate any content if needed.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Gamification System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Gamification & Progress
            </CardTitle>
            <CardDescription>Level up through participation and earn achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="gamification-1">
                <AccordionTrigger>How does the point system work?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Earn points through various activities:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-blue-500" />
                          <span className="text-sm"><strong>+10 points</strong> - Create a topic</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <span className="text-sm"><strong>+5 points</strong> - Post a reply</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm"><strong>+2 points</strong> - Receive a like</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-sm"><strong>+3 points</strong> - Daily activity streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gamification-2">
                <AccordionTrigger>What are levels and how do I progress?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>The forum has 14 levels with increasing point requirements:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="text-lg">🌱</span> <strong>Levels 1-2:</strong> 0-50 points</p>
                        <p><span className="text-lg">🥉</span> <strong>Levels 3-4:</strong> 100-250 points</p>
                        <p><span className="text-lg">🏆</span> <strong>Levels 5-7:</strong> 500-1,500 points</p>
                      </div>
                      <div>
                        <p><span className="text-lg">💎</span> <strong>Levels 8-12:</strong> 2,500-7,500 points</p>
                        <p><span className="text-lg">🔮</span> <strong>Levels 13-14:</strong> 10,000+ points</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Higher levels unlock special badges and recognition in the community.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gamification-3">
                <AccordionTrigger>What achievements can I unlock?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>Unlock special achievements by reaching milestones:</p>
                    <ul className="text-sm space-y-1">
                      <li>🏁 <strong>First Steps:</strong> Create your first topic</li>
                      <li>💬 <strong>Conversationalist:</strong> Make 10 posts</li>
                      <li>⭐ <strong>Popular:</strong> Receive 25 likes</li>
                      <li>🔥 <strong>Dedicated:</strong> Maintain a 7-day activity streak</li>
                      <li>🎯 <strong>Level Up:</strong> Reach level 5</li>
                      <li>👥 <strong>Community Builder:</strong> Create 10 topics</li>
                      <li>❤️ <strong>Well Liked:</strong> Receive 100 likes</li>
                      <li>💎 <strong>Expert:</strong> Reach level 10</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gamification-4">
                <AccordionTrigger>How do activity streaks work?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>Activity streaks track your daily participation:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Create a topic, post a reply, or like a post to maintain your streak</li>
                      <li>Streaks reset at midnight if you miss a day</li>
                      <li>Earn +3 bonus points for each day of your current streak</li>
                      <li>Your longest streak is tracked as a personal record</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      Consistent participation helps build a vibrant community!
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gamification-5">
                <AccordionTrigger>Where can I see the leaderboard?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>View community rankings in the Leaderboard section:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Overall:</strong> Ranked by total points</li>
                      <li><strong>Topics:</strong> Most topics created</li>
                      <li><strong>Posts:</strong> Most replies posted</li>
                      <li><strong>Likes:</strong> Most likes received</li>
                      <li><strong>Helpful:</strong> Based on helpful answer criteria</li>
                      <li><strong>Streaks:</strong> Longest activity streaks</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      Compete friendly with classmates and see who's most active!
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Roles & Permissions
            </CardTitle>
            <CardDescription>Understanding different user types and their capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Student</Badge>
                    <span className="font-medium">Standard Users</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create and reply to topics</li>
                    <li>• Like posts and build activity streaks</li>
                    <li>• Customize profile and upload avatars</li>
                    <li>• Participate in gamification system</li>
                    <li>• View leaderboards and other user profiles</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Teacher</Badge>
                    <span className="font-medium">Moderators</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All student permissions</li>
                    <li>• Create and manage categories</li>
                    <li>• Edit and delete any content</li>
                    <li>• Access category management tools</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Administrator</Badge>
                    <span className="font-medium">Full Access</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All teacher permissions</li>
                    <li>• User management and role assignment</li>
                    <li>• Full admin dashboard access</li>
                    <li>• System configuration and maintenance</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation & Features */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation & Additional Features</CardTitle>
            <CardDescription>Make the most of WISS Forum's features</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="navigation-1">
                <AccordionTrigger>How do I find specific topics or users?</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Browse by Category:</strong> Use the Categories page to find topics by subject</li>
                    <li><strong>Latest Topics:</strong> See the most recent discussions on the home page</li>
                    <li><strong>User Profiles:</strong> Click on usernames to view their profiles and activity</li>
                    <li><strong>Leaderboard:</strong> Find active users and their contributions</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="navigation-2">
                <AccordionTrigger>What are the main navigation sections?</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Home:</strong> Dashboard with latest topics and activity</li>
                    <li><strong>Categories:</strong> Browse topics organized by subject</li>
                    <li><strong>Users:</strong> View community members and their profiles</li>
                    <li><strong>Leaderboard:</strong> See top contributors and rankings</li>
                    <li><strong>Profile:</strong> Manage your account and view your stats</li>
                    <li><strong>Settings:</strong> Account preferences and password changes</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Support & Guidelines</CardTitle>
            <CardDescription>Get help and understand community standards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Community Guidelines:</h4>
              <ul className="text-sm space-y-1 list-disc pl-6">
                <li>Be respectful and professional in all interactions</li>
                <li>Stay on topic and contribute meaningfully to discussions</li>
                <li>Use appropriate language suitable for an educational environment</li>
                <li>Respect intellectual property and cite sources when sharing external content</li>
                <li>Profile pictures must be appropriate and follow school guidelines</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Need Technical Support?</h4>
              <p className="text-sm">
                For technical issues, account problems, or questions not covered in this guide, 
                contact the forum administrator at{" "}
                <a href="mailto:admin@wiss-edu.ch" className="text-primary hover:underline">
                  admin@wiss-edu.ch
                </a>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please include details about your issue, browser version, and steps to reproduce the problem.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 