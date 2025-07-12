"use client";

import { useState, useEffect } from 'react';
import { useBucket } from '@/context/BucketContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash, Edit, LogOut, HardDrive, Loader2 } from 'lucide-react';
import { CredentialsForm, type S3Config } from '@/components/credentials-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import LoginPage from './login/page';

export default function HomePage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { buckets, addBucket, updateBucket, deleteBucket, setSelectedBucket } = useBucket();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<S3Config & { id: string } | undefined>(undefined);

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

  const handleEditClick = (bucket: S3Config & { id: string }) => {
    setEditingBucket(bucket);
    setIsFormOpen(true);
  };

  const handleSave = (config: S3Config) => {
    if (editingBucket) {
      updateBucket(editingBucket.id, config);
    } else {
      addBucket(config);
    }
    setIsFormOpen(false);
    setEditingBucket(undefined);
  };

  const handleSelectBucket = (bucket: S3Config & { id: string }) => {
    setSelectedBucket(bucket);
    router.push(`/buckets/${bucket.id}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-headline flex items-center gap-2"><HardDrive/> S3 Navigator</h1>
        <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
      </header>
      <main className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Your Buckets</h2>
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

        {buckets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {buckets.map((bucket) => (
              <Card key={bucket.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{bucket.name}</CardTitle>
                  <CardDescription>s3://{bucket.bucket}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">Region: {bucket.region}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleSelectBucket(bucket)}>Browse</Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(bucket)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
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
                </CardFooter>
              </Card>
            ))}
          </div>
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
