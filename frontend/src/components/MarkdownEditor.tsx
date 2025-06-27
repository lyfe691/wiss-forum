import { useState, useCallback, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { FileUpload } from '@/components/FileUpload';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Edit, 
  FileText, 
  Image as ImageIcon, 
  Paperclip,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showFileUpload?: boolean;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  height?: number;
  maxFiles?: number;
  maxFileSize?: number;
  label?: string;
  required?: boolean;
  error?: string;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  className,
  disabled = false,
  showFileUpload = true,
  onFilesUploaded,
  existingFiles = [],
  height = 400,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  label,
  required = false,
  error
}: MarkdownEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Auto-insert markdown for uploaded files
    let markdownToInsert = '';
    
    files.forEach(file => {
      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        // Insert image markdown
        markdownToInsert += `\n![${file.name}](${file.url})\n`;
      } else {
        // Insert file link markdown
        markdownToInsert += `\n[📎 ${file.name}](${file.url})\n`;
      }
    });
    
    if (markdownToInsert) {
      const newValue = value + markdownToInsert;
      onChange(newValue);
    }
    
    // Call parent callback if provided
    if (onFilesUploaded) {
      onFilesUploaded(files);
    }
  }, [value, onChange, onFilesUploaded]);

  const handleFileRemoved = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    
    // Remove markdown references to the removed file
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove) {
      const imagePattern = new RegExp(`!\\[${fileToRemove.name}\\]\\(${fileToRemove.url}\\)`, 'g');
      const linkPattern = new RegExp(`\\[📎 ${fileToRemove.name}\\]\\(${fileToRemove.url}\\)`, 'g');
      
      let newValue = value.replace(imagePattern, '').replace(linkPattern, '');
      newValue = newValue.replace(/\n\n\n+/g, '\n\n'); // Clean up extra newlines
      
      onChange(newValue);
    }
  }, [uploadedFiles, value, onChange]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const insertMarkdown = (markdown: string) => {
    const newValue = value + markdown;
    onChange(newValue);
  };

  const quickInsertButtons = [
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: 'Insert Image',
      markdown: '\n![Alt text](image-url)\n',
      tooltip: 'Insert image markdown'
    },
    {
      icon: <Paperclip className="h-4 w-4" />,
      label: 'Insert Link',
      markdown: '\n[Link text](url)\n',
      tooltip: 'Insert link markdown'
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Insert Table',
      markdown: '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n\n',
      tooltip: 'Insert table markdown'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Card className={cn(
        "relative transition-all duration-200",
        isFullscreen && "fixed inset-4 z-50 bg-background",
        error && "border-destructive"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Content Editor</CardTitle>
            <div className="flex items-center gap-2">
              {/* Quick Insert Buttons */}
              <div className="flex items-center gap-1">
                {quickInsertButtons.map((button, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown(button.markdown)}
                    disabled={disabled}
                    title={button.tooltip}
                  >
                    {button.icon}
                  </Button>
                ))}
              </div>
              
              {/* Fullscreen Toggle */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-4">
              <div 
                ref={editorRef}
                className={cn(
                  "w-full",
                  isFullscreen && "h-[calc(100vh-200px)]"
                )}
              >
                <MDEditor
                  value={value}
                  onChange={(val) => onChange(val || '')}
                  height={isFullscreen ? undefined : height}
                  preview="edit"
                  hideToolbar={false}
                  textareaProps={{
                    placeholder,
                    disabled,
                    style: {
                      fontSize: 14,
                      lineHeight: 1.6,
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                    }
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <div 
                className={cn(
                  "p-4 border rounded-lg bg-muted/30",
                  isFullscreen && "h-[calc(100vh-200px)] overflow-y-auto"
                )}
                style={{ minHeight: isFullscreen ? undefined : height }}
              >
                {value ? (
                  <MarkdownRenderer content={value} variant="default" />
                ) : (
                  <div className="text-muted-foreground italic text-center py-8">
                    No content to preview
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* File Upload Section */}
          {showFileUpload && (
            <div className="border-t pt-4">
              <FileUpload
                onFilesUploaded={handleFilesUploaded}
                onFileRemoved={handleFileRemoved}
                maxFiles={maxFiles}
                maxFileSize={maxFileSize}
                disabled={disabled}
                existingFiles={uploadedFiles}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 