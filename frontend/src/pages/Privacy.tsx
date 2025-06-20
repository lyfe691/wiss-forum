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
import { Separator } from "@/components/ui/separator";
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Eye, 
  Database, 
  Lock, 
  Clock,
  Mail,
  Cookie,
  UserX,
  Globe
} from 'lucide-react';

export function Privacy() {
  const lastUpdated = "January 20, 2025";
  const effectiveDate = "January 20, 2025";

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
              Privacy Policy
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        </div>
        

        
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="px-3 py-1 font-medium">
            <Clock className="h-3 w-3 mr-1.5" />
            Last Updated: {lastUpdated}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-medium">
            <Globe className="h-3 w-3 mr-1.5" />
            GDPR Compliant
          </Badge>
        </div>
      </div>

      <div className="space-y-8">
        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              1. Information We Collect
            </CardTitle>
            <CardDescription>What personal data we gather and why</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1.1 Account Information</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Email Address:</strong> Required for account creation and must be @wiss-edu.ch or @wiss.ch</li>
                <li><strong>Username:</strong> Your chosen unique identifier with no spaces</li>
                <li><strong>Display Name:</strong> The name shown to other users</li>
                <li><strong>Password:</strong> Stored securely using industry-standard hashing</li>
                <li><strong>Role:</strong> Automatically assigned as Student, Teacher, or Admin</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">1.2 Profile Information (Optional)</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Biography:</strong> Personal description</li>
                <li><strong>Profile Picture:</strong> Uploaded avatar image or automatically generated avatar</li>
                <li><strong>GitHub URL:</strong> Link to your GitHub profile</li>
                <li><strong>Website URL:</strong> Link to your personal or portfolio website</li>
                <li><strong>LinkedIn URL:</strong> Link to your LinkedIn profile</li>
                <li><strong>Twitter URL:</strong> Link to your Twitter/X profile</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">1.3 Activity & Gamification Data</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Topics Created:</strong> Number of discussion topics you've started</li>
                <li><strong>Posts Created:</strong> Number of replies and comments you've made</li>
                <li><strong>Likes Received:</strong> Total likes on your content from other users</li>
                <li><strong>Activity Streaks:</strong> Current and longest consecutive daily activity streaks</li>
                <li><strong>Total Score:</strong> Gamification points earned through platform participation</li>
                <li><strong>Level:</strong> Your current level based on total score</li>
                <li><strong>Badges & Achievements:</strong> Earned accomplishments and recognition</li>
                <li><strong>Last Activity Date:</strong> When you last engaged with the platform</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">1.4 Content Data</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Topic Content:</strong> Titles, descriptions, and tags for topics you create</li>
                <li><strong>Post Content:</strong> Text content of your replies and comments</li>
                <li><strong>Like History:</strong> List of posts you've liked (stored as user IDs)</li>
                <li><strong>Edit History:</strong> Whether content has been edited and when</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">1.5 System Data</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account Timestamps:</strong> Creation date, last update, last active time</li>
                <li><strong>MongoDB ObjectId:</strong> Unique database identifier</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              2. How We Use Your Information
            </CardTitle>
            <CardDescription>The purposes for which we process your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">2.1 Platform Functionality</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Authenticating your account using JWT tokens stored in your browser</li>
                <li>Displaying your profile information and activity to other users</li>
                <li>Enabling topic creation, posting, and reply functionality</li>
                <li>Processing like/unlike actions on posts</li>
                <li>Calculating and updating gamification scores, levels, and achievements</li>
                <li>Tracking daily activity streaks and awarding streak bonuses</li>
                <li>Managing category access and content organization</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2.2 Communication</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sending password reset emails via Gmail SMTP when requested</li>
                <li>Processing contact form submissions and support requests</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Note:</strong> We do not send marketing emails, newsletters, or promotional content.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2.3 Content Management</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Storing and retrieving topics, posts, and user-generated content</li>
                <li>Enabling content editing and deletion by authors</li>
                <li>Processing content moderation by Teachers and Admins</li>
                <li>Managing category assignments and organization</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing and Disclosure */}
        <Card>
          <CardHeader>
            <CardTitle>3. Data Sharing and Disclosure</CardTitle>
            <CardDescription>When and with whom we share your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">3.1 Public Information</h4>
              <p className="mb-2">The following information is publicly visible to other WISS Forum users:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Username and display name</li>
                <li>Profile picture and biography</li>
                <li>Posts, comments, and replies</li>
                <li>User role (Student, Teacher, Admin)</li>
                <li>Activity statistics and gamification scores</li>
                <li>Social media links (if provided)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3.2 WISS Institution</h4>
              <p>
                We may share relevant information with WISS administrators in cases of:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Academic integrity violations</li>
                <li>Disciplinary matters requiring institutional involvement</li>
                <li>Safety concerns or inappropriate behavior</li>
                <li>Technical support requests that require verification</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3.3 Legal Requirements</h4>
              <p>
                We may disclose your information when legally required to do so, such as:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Complying with legal processes or court orders</li>
                <li>Responding to lawful requests from authorities</li>
                <li>Protecting our legal rights and interests</li>
                <li>Investigating potential crimes or safety threats</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">3.4 What We Don't Share</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>We never sell your personal information to third parties</li>
                <li>Your email address is kept private and not shared with other users</li>
                <li>Password information is never shared or stored in readable format</li>
                <li>Private messages or drafts are not accessible to other users</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              4. Data Security
            </CardTitle>
            <CardDescription>How we protect your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">4.1 Authentication Security</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>JWT Tokens:</strong> Session management with 24-hour expiring tokens (86400000ms)</li>
                <li><strong>Password Hashing:</strong> Secure password storage using Spring Security</li>
                <li><strong>Token Storage:</strong> Authentication tokens stored locally in browser localStorage</li>
                <li><strong>CORS Protection:</strong> Configured for specific allowed origins (localhost development)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">4.2 Data Storage</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>MongoDB Database:</strong> NoSQL document database hosted locally</li>
                <li><strong>Collections:</strong> Separate collections for users, posts, topics, and categories</li>
                <li><strong>Unique Indexes:</strong> Username and email uniqueness enforced at database level</li>
                <li><strong>Database References:</strong> User references linked to content using MongoDB DBRef</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4.3 Application Security</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Role-based Access:</strong> Three-tier permission system (Student/Teacher/Admin)</li>
                <li><strong>Input Validation:</strong> Server-side validation for all user inputs</li>
                <li><strong>Email Validation:</strong> Restricted to @wiss-edu.ch and @wiss.ch domains</li>
                <li><strong>Content Filtering:</strong> Username validation against inappropriate terms</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookies and Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              5. Cookies and Tracking
            </CardTitle>
            <CardDescription>How we use cookies and similar technologies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">5.1 Authentication Storage</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>localStorage:</strong> JWT authentication tokens stored locally in your browser</li>
                <li><strong>localStorage:</strong> User profile data cached for quick access</li>
                <li><strong>No Authentication Cookies:</strong> We do not use cookies for authentication</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">5.2 UI Preferences Cookie</h4>
              <p>We use only <strong>one cookie</strong> for the following purpose:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>sidebar_state:</strong> Remembers whether your sidebar is open or closed</li>
                <li><strong>Expiration:</strong> 7 days (604,800 seconds)</li>
                <li><strong>Purpose:</strong> Maintaining your preferred sidebar layout</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                This is a functional preference cookie and is not used for tracking or analytics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5.3 No Tracking or Analytics</h4>
              <p>
                WISS Forum does <strong>not</strong> use:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Google Analytics or similar tracking services</li>
                <li>Marketing or advertising cookies</li>
                <li>Social media tracking pixels</li>
                <li>Third-party analytics scripts</li>
                <li>Cross-site tracking technologies</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Privacy Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              6. Your Privacy Rights
            </CardTitle>
            <CardDescription>Your rights regarding your personal data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">6.1 Access and Portability</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>View Your Data:</strong> Access all your profile and activity data through your account</li>
                <li><strong>Data Export:</strong> Request a copy of your data for personal use</li>
                <li><strong>Activity History:</strong> Review your posts, comments, and interactions</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">6.2 Correction and Updates</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Profile Updates:</strong> Modify your profile information at any time</li>
                <li><strong>Content Editing:</strong> Edit or delete your posts and comments</li>
                <li><strong>Preference Changes:</strong> Update privacy and notification settings</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">6.3 Account Deletion</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Full Deletion:</strong> Request complete account and data removal</li>
                <li><strong>Content Anonymization:</strong> Option to anonymize posts while preserving discussions</li>
                <li><strong>Data Retention:</strong> Some data may be retained for legal or security purposes</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">6.4 Exercising Your Rights</h4>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:admin@wiss-edu.ch" className="text-primary hover:underline">
                  admin@wiss-edu.ch
                </a>{" "}
                with subject line "Privacy Rights Request - [Your Username]".
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>7. Data Retention</CardTitle>
            <CardDescription>How long we keep your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">7.1 Active Accounts</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>User Profile Data:</strong> Stored in MongoDB users collection indefinitely while account exists</li>
                <li><strong>Topics and Posts:</strong> Stored in separate MongoDB collections (topics, posts) with DBRef links</li>
                <li><strong>Gamification Data:</strong> Activity scores, streaks, and achievements maintained continuously</li>
                <li><strong>Authentication Tokens:</strong> JWT tokens expire after 24 hours and require renewal</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">7.2 Password Reset Tokens</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Expiration:</strong> Password reset tokens expire after 30 minutes</li>
                <li><strong>Single Use:</strong> Tokens are invalidated after successful password reset</li>
                <li><strong>Storage:</strong> Temporarily stored in passwordResetTokens collection</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">7.3 Browser Storage</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>localStorage Data:</strong> User profile and JWT token cleared on logout</li>
                <li><strong>Sidebar Cookie:</strong> Automatically expires after 7 days</li>
                <li><strong>Manual Clearing:</strong> You can clear browser data anytime through browser settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* International Data Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>8. International Data Transfers</CardTitle>
            <CardDescription>Information about data location and transfers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              WISS Forum is currently hosted locally for development and testing purposes. The MongoDB database 
              runs on localhost (mongodb://localhost:27017/wiss_forum) and is not accessible from external networks.
            </p>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Development Environment:</strong> This is a development/educational project. 
                Data is stored locally and not transmitted to external services except for Gmail SMTP for password resets.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>9. Children's Privacy</CardTitle>
            <CardDescription>Special protections for younger users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              While WISS Forum is designed for educational use, we recognize that some users may be under 18. 
              We take additional care to protect the privacy of younger users:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Enhanced moderation for content involving minors</li>
              <li>Stricter controls on profile information sharing</li>
              <li>Additional security measures for account protection</li>
              <li>Parental notification rights where applicable</li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle>10. Changes to This Privacy Policy</CardTitle>
            <CardDescription>How we handle privacy policy updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Update the "Last Updated" date at the top of this page</li>
              <li>Notify users of significant changes through the platform</li>
              <li>Provide at least 30 days notice for material changes</li>
              <li>Seek additional consent where required by law</li>
            </ul>
            <p>
              We encourage you to review this Privacy Policy periodically to stay informed about how we 
              protect your information.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              11. Contact Information
            </CardTitle>
            <CardDescription>How to reach us with privacy questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="space-y-2">
                <p><strong>WISS Forum Data Protection Officer</strong></p>
                <p>Email: <a href="mailto:admin@wiss-edu.ch" className="text-primary hover:underline">admin@wiss-edu.ch</a></p>
                <p>Subject Line: "Privacy Policy - [Your Username]"</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              We are committed to addressing your privacy concerns promptly and will respond within 5 business days.
            </p>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Your Privacy Matters:</strong> We are committed to transparency and protecting your privacy. 
                This policy reflects our dedication to responsible data handling in accordance with GDPR and Swiss privacy laws.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Separator />
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>This privacy policy is effective as of {effectiveDate}.</p>
        </div>
      </div>
    </div>
  );
} 