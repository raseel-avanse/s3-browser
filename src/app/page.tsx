"use client";

import { useState, useEffect } from 'react';
import { useBucket, type Bucket } from '@/context/BucketContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash, Edit, LogOut, HardDrive, Loader2, Users, HelpCircle, CheckCircle, XCircle, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { CredentialsForm, type S3Config } from '@/components/credentials-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import LoginPage from './login/page';
import { validateS3Connection } from '@/actions/s3';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type ViewType = 'card' | 'list';

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { buckets, addBucket, updateBucket, deleteBucket, setBucketStatus } = useBucket();
  const router = useRouter();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<Bucket | undefined>(undefined);
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('card');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  const handleAddClick = () => {
    setEditingBucket(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setIsFormOpen(true);
  };

  const handleSave = (config: S3Config) => {
    if (editingBucket) {
      updateBucket(editingBucket.id, { ...config, status: editingBucket.status });
    } else {
      addBucket({ ...config, status: 'untested' });
    }
    setIsFormOpen(false);
    setEditingBucket(undefined);
  };

  const handleSelectBucket = (bucket: Bucket) => {
    if (bucket.status !== 'connected') {
      toast({
        variant: "destructive",
        title: "Connection Not Verified",
        description: "Please test the connection successfully before browsing the bucket.",
      });
      return;
    }
    router.push(`/buckets/${bucket.id}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleTestConnection = async (bucket: Bucket) => {
    setTestingConnectionId(bucket.id);
    const result = await validateS3Connection(bucket);
    if (result.success) {
      setBucketStatus(bucket.id, 'connected');
      toast({ title: 'Success', description: result.message, duration: 1000 });
    } else {
      setBucketStatus(bucket.id, 'failed');
      toast({ variant: 'destructive', title: 'Connection Failed', description: result.message });
    }
    setTestingConnectionId(null);
  };

  const getStatusIcon = (status: Bucket['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="secondary" className="border-green-500 text-green-700"><CheckCircle className="mr-1 h-3 w-3" /> Connected</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Failed</Badge>;
      case 'untested':
      default:
        return <Badge variant="outline"><HelpCircle className="mr-1 h-3 w-3" /> Untested</Badge>;
    }
  };

  const BucketActions = ({ bucket }: { bucket: Bucket }) => (
    <div className="flex gap-2 justify-end">
       <Button 
          variant="secondary" 
          size="sm"
          onClick={(e) => { e.stopPropagation(); handleTestConnection(bucket); }}
          disabled={testingConnectionId === bucket.id}
      >
          {testingConnectionId === bucket.id ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              <RefreshCw className="mr-2 h-4 w-4" />}
          Test
      </Button>
      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(bucket); }}><Edit className="h-4 w-4" /></Button>
      <AlertDialog onOpenChange={(e) => e.stopPropagation()}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-9 w-9" onClick={(e) => e.stopPropagation()}><Trash className="h-4 w-4" /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{bucket.name}" bucket configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteBucket(bucket.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-headline flex items-center gap-2"><HardDrive/> S3 Navigator</h1>
        <div className="flex items-center gap-4">
          {user?.username === 'admin' && (
             <Link href="/users" passHref>
                <Button variant="outline"><Users className="mr-2 h-4 w-4" /> User Management</Button>
            </Link>
          )}
          <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
        </div>
      </header>
      <main className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Bucket List</h2>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 bg-muted p-1 rounded-lg'>
                <Button variant={view === 'card' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('card')}><LayoutGrid/></Button>
                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')}><List/></Button>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddClick}><Plus className="mr-2 h-4 w-4" /> Add S3 Bucket</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingBucket ? 'Edit Bucket' : 'Add New S3 Bucket'}</DialogTitle>
                </DialogHeader>
                <CredentialsForm 
                  onSave={handleSave} 
                  onCancel={() => setIsFormOpen(false)}
                  initialData={editingBucket}
                  isEditing={!!editingBucket}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {buckets.length > 0 ? (
          view === 'card' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {buckets.map((bucket) => (
                <Card key={bucket.id} className="flex flex-col cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectBucket(bucket)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{bucket.name}</CardTitle>
                        <CardDescription>s3://{bucket.bucket}</CardDescription>
                      </div>
                      {getStatusIcon(bucket.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">Region: {bucket.region}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleSelectBucket(bucket); }} disabled={bucket.status !== 'connected'}>Browse</Button>
                    <div className="flex gap-2">
                       <BucketActions bucket={bucket} />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Bucket</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {buckets.map(bucket => (
                            <TableRow key={bucket.id} onClick={() => handleSelectBucket(bucket)} className="cursor-pointer">
                                <TableCell className="font-medium">{bucket.name}</TableCell>
                                <TableCell>s3://{bucket.bucket}</TableCell>
                                <TableCell>{bucket.region}</TableCell>
                                <TableCell>{getStatusIcon(bucket.status)}</TableCell>
                                <TableCell className="text-right">
                                    <BucketActions bucket={bucket} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </Card>
          )
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-medium">No buckets yet</h3>
            <p className="text-muted-foreground mb-4">Add your first S3 bucket to get started.</p>
            <Button onClick={handleAddClick}><Plus className="mr-2 h-4 w-4" /> Add S3 Bucket</Button>
          </div>
        )}
      </main>
    </div>
  );
}
