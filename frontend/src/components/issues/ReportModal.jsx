import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { useIssues } from '@/hooks/useIssues';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function ReportModal({ open, onOpenChange, onSuccess }) {
  const { createIssueAsync, isCreating, createError } = useIssues();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = useCallback(() => {
    setDescription('');
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!description.trim() || !image) {
      return;
    }

    try {
      await createIssueAsync({ description: description.trim(), image });
      resetForm();
      onOpenChange?.(false);
      onSuccess?.();
    } catch {
      // createError is displayed in the form
    }
  };

  const handleOpenChange = (nextOpen) => {
    if (isCreating) {
      return;
    }

    if (!nextOpen) {
      resetForm();
    }

    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="relative sm:max-w-lg" showCloseButton={!isCreating}>
        {isCreating && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg bg-background/95 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium">AI is analyzing your report...</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Classifying category and severity
            </p>
          </div>
        )}

        <DialogHeader>
          <DialogTitle>Report a Civic Issue</DialogTitle>
          <DialogDescription>
            Upload a photo and describe the problem. Our AI will categorize and score severity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue in detail..."
              disabled={isCreating}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Photo evidence</Label>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isCreating}
                onChange={(event) => handleFile(event.target.files?.[0])}
              />

              {previewUrl ? (
                <div className="relative w-full">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-md object-contain"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    className="absolute top-0 right-0"
                    disabled={isCreating}
                    onClick={(event) => {
                      event.stopPropagation();
                      resetForm();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    {isDragging ? (
                      <Upload className="h-5 w-5 text-primary" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    Drag & drop an image here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
          </div>

          {createError && (
            <p className="text-sm text-destructive">
              {createError?.response?.data?.message || createError.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isCreating}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !description.trim() || !image}>
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
