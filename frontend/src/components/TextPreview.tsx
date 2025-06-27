import { memo } from 'react';
import { cn } from '@/lib/utils';

interface TextPreviewProps {
  content: string;
  maxLength?: number;
  className?: string;
  showEllipsis?: boolean;
}

/**
 * Strip markdown syntax and HTML tags from text for clean previews
 */
function stripMarkdownAndHtml(text: string): string {
  if (!text) return '';
  
  return text
    // Remove HTML tags first
    .replace(/<[^>]*>/g, '')
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '[code block]')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links (keep link text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images (show alt text or placeholder)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, (_match, alt) => alt || '[image]')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove lists (keep content)
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '')
    // Remove horizontal rules
    .replace(/^-{3,}$/gm, '')
    .replace(/^\*{3,}$/gm, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export const TextPreview = memo(({ 
  content, 
  maxLength = 200, 
  className,
  showEllipsis = true 
}: TextPreviewProps) => {
  if (!content || content.trim() === '') {
    return (
      <span className={cn("text-muted-foreground italic", className)}>
        No content available
      </span>
    );
  }

  const cleanText = stripMarkdownAndHtml(content);
  
  const truncatedText = cleanText.length > maxLength 
    ? cleanText.substring(0, maxLength).trim() + (showEllipsis ? '...' : '')
    : cleanText;

  return (
    <span className={cn("text-muted-foreground leading-relaxed", className)}>
      {truncatedText}
    </span>
  );
});

TextPreview.displayName = 'TextPreview'; 