"use client";

import { S3Client, ListObjectsV2Command, _Object, CommonPrefix, S3ClientConfig } from "@aws-sdk/client-s3";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBytes } from "@/lib/utils";
import { Folder, File, HardDrive, LogOut, Home, Loader2, FileImage, FileText, Music, Video, Search } from "lucide-react";
import ObjectDetails from "./object-details";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import type { Bucket } from "@/context/BucketContext";
import { ToastAction } from "@/components/ui/toast";
import { Input } from "./ui/input";

type S3Item = (_Object | CommonPrefix) & { type: 'file' | 'folder' };

const getFileIcon = (key?: string) => {
    if (!key) return <File className="h-5 w-5 text-muted-foreground" />;
    const extension = key.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
            return <FileImage className="h-5 w-5 text-blue-500" />;
        case 'mp3':
        case 'wav':
            return <Music className="h-5 w-5 text-purple-500" />;
        case 'mp4':
        case 'mov':
        case 'avi':
            return <Video className="h-5 w-5 text-red-500" />;
        case 'txt':
        case 'md':
        case 'docx':
        case 'pdf':
            return <FileText className="h-5 w-5 text-green-500" />;
        default:
            return <File className="h-5 w-5 text-muted-foreground" />;
    }
};

interface S3BrowserProps {
  config: Bucket;
  onDisconnect: () => void;
}

export default function S3Browser({ config, onDisconnect }: S3BrowserProps) {
  const [prefix, setPrefix] = useState("");
  const [items, setItems] = useState<S3Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<S3Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [s3Client, setS3Client] = useState<S3Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const s3ClientOptions: S3ClientConfig = {
      region: config.region,
    };
    if (config.accessKeyId && config.secretAccessKey) {
      s3ClientOptions.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      }
    }
    setS3Client(new S3Client(s3ClientOptions));
  }, [config]);

  const fetchItems = useCallback(async (currentPrefix: string) => {
    if (!s3Client) return;
    setIsLoading(true);
    
    try {
      const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: currentPrefix,
        Delimiter: "/",
      });
      const response = await s3Client.send(command);
      
      const folders: S3Item[] = (response.CommonPrefixes || []).map(p => ({ ...p, type: 'folder' }));
      const files: S3Item[] = (response.Contents || []).filter(c => c.Key !== currentPrefix && c.Size! > 0).map(c => ({ ...c, type: 'file' }));

      setItems([...folders, ...files]);
    } catch (e: any) {
       let description = e.message || "Failed to fetch bucket contents. Please check credentials and bucket name.";
       if (e.name === 'NetworkError' || (e.message && e.message.toLowerCase().includes('failed to fetch'))) {
            description = "This might be a CORS issue. Your S3 bucket needs to be configured to allow requests from this web application's domain. Please check your bucket's CORS settings.";
       }
       toast({
        variant: "destructive",
        title: "Connection Error",
        description: description,
        action: description.includes('CORS') ? 
            <ToastAction altText="Learn More" onClick={() => window.open('https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html', '_blank')}>Learn More</ToastAction> : undefined,
        duration: description.includes('CORS') ? 20000 : 5000,
      });
      console.error(e);
      onDisconnect();
    } finally {
      setIsLoading(false);
    }
  }, [config.bucket, s3Client, toast, onDisconnect]);

  useEffect(() => {
    if (s3Client) {
      fetchItems(prefix);
    }
  }, [prefix, s3Client, fetchItems]);
  
  const handleItemClick = (item: S3Item) => {
    if (item.type === 'folder' && item.Prefix) {
      setPrefix(item.Prefix);
      setSearchQuery(""); // Reset search when navigating folders
    } else {
      setSelectedItem(item);
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    setPrefix(path);
    setSearchQuery(""); // Reset search when navigating folders
  };
  
  const breadcrumbParts = ['home', ...prefix.split('/').filter(Boolean)];

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => {
        const name = item.type === 'folder' 
            ? item.Prefix?.replace(prefix, '').replace('/', '') 
            : item.Key?.replace(prefix, '');
        return name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [items, searchQuery, prefix]);

  return (
    <Card className="w-full h-[95vh] max-w-7xl shadow-lg flex flex-col">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b p-4 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <HardDrive className="h-6 w-6 text-primary" />
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl font-headline">{config.name} (s3://{config.bucket})</CardTitle>
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbParts.map((part, index) => {
                  const isLast = index === breadcrumbParts.length - 1;
                  const path = index === 0 ? '' : breadcrumbParts.slice(1, index + 1).join('/') + '/';
                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="font-normal">{part === 'home' ? <Home className="h-4 w-4" /> : part}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild>
                              <button onClick={() => handleBreadcrumbClick(path)} className="hover:text-primary transition-colors">
                                {part === 'home' ? <Home className="h-4 w-4" /> : part}
                              </button>
                            </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search in this folder..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button variant="outline" onClick={onDisconnect}><LogOut className="mr-2 h-4 w-4" /> Back</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-y-auto relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? filteredItems.map((item, index) => (
                <TableRow key={item.Key || item.Prefix || index} onClick={() => handleItemClick(item)} className="cursor-pointer hover:bg-accent/50">
                  <TableCell>
                    {item.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-primary" />
                    ) : (
                      getFileIcon(item.Key)
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.type === 'folder' ? item.Prefix?.replace(prefix, '').replace('/', '') : item.Key?.replace(prefix, '')}
                  </TableCell>
                  <TableCell>
                    {item.type === 'file' && item.LastModified ? new Date(item.LastModified).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.type === 'file' && item.Size != null ? formatBytes(item.Size) : '—'}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    {searchQuery ? `No results for "${searchQuery}"` : "This folder is empty."}
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <ObjectDetails 
        item={selectedItem}
        bucketConfig={config}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </Card>
  );
}
