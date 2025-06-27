import { memo } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

interface MarkdownRendererProps {
  content: string;
  variant?: 'default' | 'compact' | 'preview';
  className?: string;
}

export const MarkdownRenderer = memo(({ content, variant = 'default', className }: MarkdownRendererProps) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn('markdown-renderer', `markdown-${variant}`, className)} data-color-mode={theme}>
      <MarkdownPreview
        source={content}
        rehypePlugins={[rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        skipHtml={false}
        style={{
          backgroundColor: 'transparent',
          padding: 0,
        }}
      />
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer'; 