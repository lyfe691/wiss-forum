import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { canEditContent, canDeleteContent, getEditRestrictionMessage, ContentItem } from '@/lib/permissions';
import { toast } from 'sonner';

interface ContentActionsProps {
  content: ContentItem;
  contentType: 'topic' | 'post';
  onEdit?: (content: ContentItem, newData: any) => Promise<void>;
  onDelete?: (content: ContentItem) => Promise<void>;
  editTimeLimit?: number; // in minutes
  className?: string;
  variant?: 'dropdown' | 'inline';
  size?: 'sm' | 'default';
}

export function ContentActions({
  content,
  contentType,
  onEdit,
  onDelete,
  editTimeLimit = 15,
  className = '',
  variant = 'dropdown',
  size = 'default'
}: ContentActionsProps) {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const canEdit = contentType === 'post' ? canEditContent(user, content) : false; // Disable topic editing
  const canDelete = canDeleteContent(user, content);
  const editRestriction = getEditRestrictionMessage(user, content, editTimeLimit);

  // Don't render if user has no permissions
  if (!canEdit && !canDelete) {
    return null;
  }

  const handleEdit = () => {
    if (editRestriction) {
      toast.error(editRestriction);
      return;
    }

    // Only posts can be edited now
    setEditData({
      content: (content as any).content || ''
    });
    
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!onEdit) return;
    
    setIsEditing(true);
    try {
      await onEdit(content, editData);
      setShowEditDialog(false);
      toast.success(`${contentType === 'topic' ? 'Topic' : 'Post'} updated successfully`);
    } catch (error: any) {
      toast.error(error.message || `Failed to update ${contentType}`);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(content);
      setShowDeleteDialog(false);
      toast.success(`${contentType === 'topic' ? 'Topic' : 'Post'} deleted successfully`);
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${contentType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (variant === 'inline') {
    return (
      <>
        <div onClick={(e) => e.stopPropagation()} className={`flex items-center gap-1 z-10 ${className}`}>
          {canEdit && (
            <Button
              variant="ghost"
              size={size}
              onClick={handleEdit}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size={size}
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[625px]" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>
                Make changes to your post. You can edit within {editTimeLimit} minutes of creation.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <MarkdownEditor
                  label="Content"
                  value={editData.content || ''}
                  onChange={(value) => setEditData({ ...editData, content: value })}
                  placeholder="Enter post content"
                  height={200}
                  showFileUpload={false}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditSubmit} 
                disabled={isEditing || !editData.content?.trim()}
              >
                {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {contentType === 'topic' ? 'Topic' : 'Post'}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this {contentType}? This action cannot be undone.
                {contentType === 'topic' && ' All replies will also be deleted.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <div onClick={(e) => e.stopPropagation()} className="z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={size} className={`h-8 w-8 p-0 ${className}`}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {canEdit && canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[625px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post. You can edit within {editTimeLimit} minutes of creation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <MarkdownEditor
                label="Content"
                value={editData.content || ''}
                onChange={(value) => setEditData({ ...editData, content: value })}
                placeholder="Enter post content"
                height={200}
                showFileUpload={false}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              disabled={isEditing || !editData.content?.trim()}
            >
              {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {contentType === 'topic' ? 'Topic' : 'Post'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {contentType}? This action cannot be undone.
              {contentType === 'topic' && ' All replies will also be deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 