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
  Scale, 
  Shield, 
  AlertTriangle, 
  UserCheck, 
  Clock,
  Mail,
  School
} from 'lucide-react';

export function Terms() {
  const lastUpdated = "January 24, 2025";
  const effectiveDate = "January 24, 2025";

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
              Terms of Service
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <Scale className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        </div>
        

        
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="px-3 py-1 font-medium">
            <Clock className="h-3 w-3 mr-1.5" />
            Last Updated: {lastUpdated}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-medium">
            <UserCheck className="h-3 w-3 mr-1.5" />
            Effective: {effectiveDate}
          </Badge>
        </div>
      </div>

      <div className="space-y-8">
        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              1. Acceptance of Terms
            </CardTitle>
            <CardDescription>Your agreement to these terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing and using WISS Forum ("the Service"), you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p>
              This Service is operated by WISS (Wirtschaftsinformatikschule Schweiz) and is intended exclusively 
              for students, faculty, and staff of WISS educational institutions.
            </p>
          </CardContent>
        </Card>

        {/* Eligibility and Account Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              2. Eligibility and Account Registration
            </CardTitle>
            <CardDescription>Who can use WISS Forum and account requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">2.1 Eligibility Requirements</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must provide an email address ending with @wiss-edu.ch or @wiss.ch</li>
                <li>Username must have no spaces and no inappropriate terms</li>
                <li>Display name is required</li>
                <li>Password must have no spaces</li>
                <li>You must provide accurate registration information</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2.2 Account Security</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>JWT authentication tokens expire automatically after 24 hours</li>
                <li>Tokens are stored locally in your browser's localStorage</li>
                <li>You are responsible for logging out on shared computers</li>
                <li>Password reset tokens expire after 30 minutes for security</li>
                <li>Sharing account credentials is prohibited</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              3. Acceptable Use Policy
            </CardTitle>
            <CardDescription>Guidelines for appropriate behavior and content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">3.1 Permitted Uses</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Academic discussions and knowledge sharing</li>
                <li>Seeking and providing educational assistance</li>
                <li>Professional networking within the WISS community</li>
                <li>Collaborative learning and project discussions</li>
                <li>Sharing educational resources and study materials</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400">3.2 Prohibited Activities</h4>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Post content that is offensive, discriminatory, or harassing</li>
                <li>Upload malicious software, viruses, or harmful code (also via links.)</li>
                <li>Impersonate other users or provide false information</li>
                <li>Spam, advertise commercial products, or engage in promotional activities</li>
                <li>Violate intellectual property rights or copyright laws</li>
                <li>Attempt to gain unauthorized access to systems or user accounts</li>
                <li>Use the platform for any illegal activities</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Content and Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>4. User Content and Intellectual Property</CardTitle>
            <CardDescription>Rights and responsibilities regarding content you post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">4.1 Content Management</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>User content is stored and linked to your account</li>
                <li>Content includes topics, posts, and associated metadata</li>
                <li>We track interactions such as likes and replies</li>
                <li>Content may be analyzed for moderation purposes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">4.2 Content Ownership and Rights</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>You retain ownership of content you create and post</li>
                <li>Content remains linked to your user account via database references</li>
                <li>Teachers and Admins can moderate any content based on role permissions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4.3 Activity and Engagement</h4>
              <p>We track user activity and may award points or achievements to encourage participation and engagement within the platform. Details about the point system and achievements can be found in the platform's documentation.</p>
            </div>
          </CardContent>
        </Card>

        {/* Moderation and Enforcement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              5. Moderation and Enforcement
            </CardTitle>
            <CardDescription>How we maintain community standards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">5.1 Role-Based Permissions</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Students:</strong> Can create topics, posts, like content, and edit their own content</li>
                <li><strong>Teachers:</strong> Have all Student permissions plus category management and content moderation</li>
                <li><strong>Admins:</strong> Have all permissions including user management and full system access</li>
                <li>Role hierarchy: STUDENT &lt; TEACHER &lt; ADMIN (checked via hasAtLeastSamePrivilegesAs method)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">5.2 Content Moderation System</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Username validation prevents inappropriate terms during registration</li>
                <li>Teachers and Admins can edit or delete any content</li>
                <li>Students can only modify their own content</li>
                <li>Content is linked to user accounts via MongoDB database references</li>
                <li>No automated content filtering or reporting system is currently implemented</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Service Availability and Modifications */}
        <Card>
          <CardHeader>
            <CardTitle>6. Service Availability and Modifications</CardTitle>
            <CardDescription>Platform availability and our right to make changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">6.1 Service Availability</h4>
              <p>This platform is provided for educational purposes. As a development project, service availability and performance may vary. No guarantees are made regarding uptime or continuous accessibility.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">6.2 Platform Limitations</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Service is intended for internal WISS community use only, however, viewing is public.</li>
                <li>Features and functionality may change without notice</li>
                <li>Data persistence is not guaranteed during development phases</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data and Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>7. Data and Privacy</CardTitle>
            <CardDescription>How we handle your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your privacy is important to us. Please review our{" "}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>{" "}
              to understand how we collect, use, and protect your information.
            </p>
            <p>
              By using the Service, you consent to the collection and processing of your data as described 
              in our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimers and Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>8. Disclaimers and Limitation of Liability</CardTitle>
            <CardDescription>Important legal disclaimers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">8.1 Disclaimers</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>The Service is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee the accuracy, completeness, or reliability of user-generated content</li>
                <li>Academic content shared by users should be independently verified</li>
                <li>We are not responsible for the actions or content of other users</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">8.2 Limitation of Liability</h4>
              <p>
                To the maximum extent permitted by law, WISS shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages arising from your use of the Service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>9. Changes to These Terms</CardTitle>
            <CardDescription>How we may update these terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update these Terms of Service from time to time. When we do, we will:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Update the "Last Updated" date at the top of this page</li>
              <li>Notify users through the platform when significant changes are made</li>
              <li>Provide a reasonable period for review before changes take effect</li>
            </ul>
            <p>
              Your continued use of the Service after changes are posted constitutes acceptance of the updated terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              10. Contact Information
            </CardTitle>
            <CardDescription>How to reach us with questions or concerns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have questions about these Terms of Service or need to report a violation, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="space-y-2">
                <p><strong>WISS Forum Administration</strong></p>
                <p>Email: <a href="" className="text-primary hover:underline"></a></p>
                <p>Subject Line: "Terms of Service - [Your Username]"</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              We aim to respond to all inquiries within 2-3 business days.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <Separator />
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>These terms are effective as of {effectiveDate}.</p>
        </div>
      </div>
    </div>
  );
}