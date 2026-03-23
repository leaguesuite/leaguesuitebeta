import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  FileText, Image, Plus, Trash2, ExternalLink, Search, Upload, Eye, EyeOff, GripVertical,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Document {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  show_in_menu: boolean;
  menu_order: number;
  created_at: string;
  updated_at: string;
}

// Mock data for UI preview (used when no real data exists)
const mockDocuments: Document[] = [
  {
    id: '1', org_id: 'org1', title: 'League Rules & Bylaws', description: 'Official rules for the 2025 season',
    file_url: '#', file_type: 'pdf', file_size: 245000, show_in_menu: true, menu_order: 0,
    created_at: '2025-03-01T00:00:00Z', updated_at: '2025-03-01T00:00:00Z',
  },
  {
    id: '2', org_id: 'org1', title: 'Registration Waiver', description: 'Liability waiver for all participants',
    file_url: '#', file_type: 'pdf', file_size: 120000, show_in_menu: true, menu_order: 1,
    created_at: '2025-02-15T00:00:00Z', updated_at: '2025-02-15T00:00:00Z',
  },
  {
    id: '3', org_id: 'org1', title: 'Field Map — Memorial Park', description: 'Layout of all fields at Memorial Park',
    file_url: '#', file_type: 'png', file_size: 890000, show_in_menu: true, menu_order: 2,
    created_at: '2025-01-20T00:00:00Z', updated_at: '2025-01-20T00:00:00Z',
  },
  {
    id: '4', org_id: 'org1', title: 'Referee Handbook', description: 'Official referee guidelines and signals',
    file_url: '#', file_type: 'pdf', file_size: 510000, show_in_menu: false, menu_order: 3,
    created_at: '2025-01-10T00:00:00Z', updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: '5', org_id: 'org1', title: 'Season Schedule Flyer', description: null,
    file_url: '#', file_type: 'png', file_size: 1200000, show_in_menu: false, menu_order: 4,
    created_at: '2025-03-10T00:00:00Z', updated_at: '2025-03-10T00:00:00Z',
  },
];

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showInMenu, setShowInMenu] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('menu_order', { ascending: true });
      if (error) {
        console.error('Error fetching documents:', error);
        return mockDocuments;
      }
      return data.length > 0 ? (data as Document[]) : mockDocuments;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !title.trim()) throw new Error('Missing required fields');

      setUploading(true);
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf';
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // TODO: Replace with real org_id from auth context
      const orgId = 'placeholder-org-id';

      // Insert metadata
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          org_id: orgId,
          title: title.trim(),
          description: description.trim() || null,
          file_url: urlData.publicUrl,
          file_type: fileExt,
          file_size: selectedFile.size,
          show_in_menu: showInMenu,
          menu_order: documents.length,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(`Upload failed: ${err.message}`);
    },
    onSettled: () => setUploading(false),
  });

  // Toggle menu visibility
  const toggleMenuVisibility = useMutation({
    mutationFn: async ({ id, show }: { id: string; show: boolean }) => {
      const { error } = await supabase
        .from('documents')
        .update({ show_in_menu: show })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Menu visibility updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (doc: Document) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
      setDeleteDialog(null);
    },
    onError: () => toast.error('Failed to delete document'),
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setShowInMenu(true);
    setSelectedFile(null);
    setSheetOpen(false);
  };

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const menuCount = documents.filter((d) => d.show_in_menu).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Upload PDFs and images. Toggle "Show in Menu" to display on your public site navigation.
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{documents.length}</p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{menuCount}</p>
                <p className="text-xs text-muted-foreground">Visible in Menu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{documents.length - menuCount}</p>
                <p className="text-xs text-muted-foreground">Hidden from Menu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">All Documents</CardTitle>
            <span className="text-xs text-muted-foreground">{filtered.length} documents</span>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading documents...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">No documents found</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a PDF or image to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-center">In Menu</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {doc.file_type === 'pdf' ? (
                            <FileText className="h-4 w-4 text-destructive" />
                          ) : (
                            <Image className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase text-[10px]">
                        {doc.file_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(doc.file_size)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={doc.show_in_menu}
                        onCheckedChange={(checked) =>
                          toggleMenuVisibility.mutate({ id: doc.id, show: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog(doc)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Upload Document</SheetTitle>
            <SheetDescription>
              Upload a PDF or image file. Toggle "Show in Menu" to make it accessible from the public site navigation.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Title *</Label>
              <Input
                id="doc-title"
                placeholder="e.g. League Rules & Bylaws"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-desc">Description</Label>
              <Textarea
                id="doc-desc"
                placeholder="Optional description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-file">File *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedFile ? selectedFile.name : 'Click to select or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground">PDF, PNG, JPG — max 20 MB</p>
                <Input
                  id="doc-file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="mt-3"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label className="text-sm font-medium">Show in Menu</Label>
                <p className="text-xs text-muted-foreground">
                  Display this document in the public site navigation
                </p>
              </div>
              <Switch checked={showInMenu} onCheckedChange={setShowInMenu} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => uploadMutation.mutate()}
                disabled={!title.trim() || !selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog?.title}"? This will remove the file and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && deleteMutation.mutate(deleteDialog)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
