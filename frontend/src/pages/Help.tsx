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
import { Link } from 'react-router-dom';

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

      <h1 className="text-3xl font-bold tracking-tight mb-2">Help Center</h1>
      <p className="text-muted-foreground mb-8">Find answers to common questions and learn how to use WISS Forum</p>

      <div className="grid gap-8">
        {/* Getting Started Section */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Basic information about WISS Forum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              WISS Forum is a discussion platform designed for students and teachers to collaborate, 
              share knowledge, and engage in academic discussions.
            </p>

            <h3 className="font-medium text-lg mt-4">Key Features:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browse topics organized by categories</li>
              <li>Create new discussion topics</li>
              <li>Reply to existing discussions</li>
              <li>Customize your profile</li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create a new topic?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">To create a new topic:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Navigate to a category by clicking on "Categories" in the navigation bar</li>
                    <li>Select the relevant category for your topic</li>
                    <li>Click the "New Topic" button</li>
                    <li>Fill in the topic title and content</li>
                    <li>Click "Create Topic" to publish</li>
                  </ol>
                  <p className="mt-2">You must be logged in to create a new topic.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>How do I reply to a topic?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">To reply to a topic:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Navigate to the topic you want to reply to</li>
                    <li>Scroll down to the reply box at the bottom of the page</li>
                    <li>Type your reply in the text area</li>
                    <li>Click "Post Reply" to submit your response</li>
                  </ol>
                  <p className="mt-2">You can also reply directly to a specific post by clicking the "Reply" button on that post.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How do I edit my profile?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Click on your profile picture or username in the navigation bar</li>
                    <li>Select "Profile" from the dropdown menu</li>
                    <li>Click on the "Edit Profile" tab</li>
                    <li>Update your information as needed</li>
                    <li>Click "Save Changes" to apply your edits</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>What are the different user roles?</AccordionTrigger>
                <AccordionContent>
                  <p>WISS Forum has three main user roles:</p>
                  <ul className="list-disc pl-6 space-y-2 my-2">
                    <li><strong>Students</strong> - Regular users who can create topics, post replies, and participate in discussions</li>
                    <li><strong>Teachers</strong> - Moderators who can create categories, pin important topics, and have additional moderation capabilities</li>
                    <li><strong>Administrators</strong> - Full system administrators who can manage all aspects of the forum</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>Contact administrator for additional support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you couldn't find an answer to your question, please contact the forum administrator 
              at <a href="mailto:admin@wiss-forum.edu" className="text-primary hover:underline">admin@wiss-forum.edu</a>
            </p>
            <p>
              Please include as much detail as possible about your issue to help us assist you more efficiently.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 