"use client";

import { S3Client, ListObjectsV2Command, _Object, CommonPrefix, S3ClientConfig } from "@aws-sdk/client-s3";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { type S3Config } from "./credentials-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBytes } from "@/lib/utils";
import { Folder, File, HardDrive, LogOut, Home, Loader2, FileImage, FileText, Music, Video } from "lucide-react";
import ObjectDetails from "./object-details";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";

type S3Item = (_Object | CommonPrefix) & { type: 'file' | 'folder' };

const dummyFolders: S3Item[] = [
  { Prefix: "documents/", type: 'folder' },
  { Prefix: "images/", type: 'folder' },
  { Prefix: "media/", type: 'folder' },
];

const dummyFiles: S3Item[] = [
    { Key: "project-brief.docx", LastModified: new Date('2023-10-26T10:00:00Z'), Size: 12345, type: 'file' },
    { Key: "company-logo.png", LastModified: new Date('2023-10-25T15:30:00Z'), Size: 5678, type: 'file' },
    { Key: "team-photo.jpg", LastModified: new Date('2023-09-12T11:20:00Z'), Size: 450000, type: 'file' },
    { Key: "quarterly-report.pdf", LastModified: new Date('2023-10-20T18:00:00Z'), Size: 1200000, type: 'file' },
    { Key: "onboarding-video.mp4", LastModified: new Date('2023-08-01T09:00:00Z'), Size: 25000000, type: 'file' },
    { Key: "background-music.mp3", LastModified: new Date('2023-07-15T14:45:00Z'), Size: 3500000, type: 'file' },
];

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
  config: S3Config;
  onDisconnect: () => void;
  useDummyData?: boolean;
}

export default function S3Browser({ config, onDisconnect, useDummyData = false }: S3BrowserProps) {
  const [prefix, setPrefix] = useState("");
  const [items, setItems] = useState<S3Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<S3Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const s3Client = useMemo(() => {
    if (useDummyData) return null;
    const s3ClientOptions: S3ClientConfig = {
      region: config.region,
    };
    if (config.accessKeyId && config.secretAccessKey) {
      s3ClientOptions.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      }
    }
    return new S3Client(s3ClientOptions);
  }, [config, useDummyData]);

  const fetchItems = useCallback(async (currentPrefix: string) => {
    setIsLoading(true);
    if (useDummyData) {
      setTimeout(() => {
        if (currentPrefix === "") {
            setItems([...dummyFolders, ...dummyFiles]);
        } else {
            // In a real scenario, you'd have nested dummy data.
            // For now, we'll just show an empty folder.
            setItems([]);
        }
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: currentPrefix,
        Delimiter: "/",
      });
      const response = await s3Client!.send(command);
      
      const folders: S3Item[] = (response.CommonPrefixes || []).map(p => ({ ...p, type: 'folder' }));
      const files: S3Item[] = (response.Contents || []).filter(c => c.Key !== currentPrefix && c.Size! > 0).map(c => ({ ...c, type: 'file' }));

      setItems([...folders, ...files]);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: e.message || "Failed to fetch bucket contents. Please check credentials and bucket name.",
      });
      console.error(e);
      onDisconnect();
    } finally {
      setIsLoading(false);
    }
  }, [config.bucket, s3Client, toast, onDisconnect, useDummyData]);

  useEffect(() => {
    fetchItems(prefix);
  }, [prefix, fetchItems]);
  
  const handleItemClick = (item: S3Item) => {
    if (item.type === 'folder' && item.Prefix) {
      setPrefix(item.Prefix);
    } else {
      setSelectedItem(item);
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    setPrefix(path);
  };
  
  const breadcrumbParts = ['home', ...prefix.split('/').filter(Boolean)];

  return (
    <Card className="w-full h-[90vh] max-w-7xl shadow-lg flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <HardDrive className="h-6 w-6 text-primary" />
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl font-headline">s3://{config.bucket}</CardTitle>
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
        <Button variant="outline" onClick={onDisconnect}><LogOut className="mr-2 h-4 w-4" /> Disconnect</Button>
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
              {items.length > 0 ? items.map((item, index) => (
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
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">This folder is empty.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <ObjectDetails 
        item={selectedItem}
        bucket={config.bucket}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </Card>
  );
}
