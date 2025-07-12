import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { _Object, CommonPrefix } from "@aws-sdk/client-s3";
import { formatBytes } from "@/lib/utils";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

type S3Item = (_Object | CommonPrefix) & { type: 'file' | 'folder' };

interface ObjectDetailsProps {
  item: S3Item | null;
  bucket: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ObjectDetails({ item, bucket, open, onOpenChange }: ObjectDetailsProps) {
  if (!item) return null;

  const isFile = item.type === 'file';
  const name = isFile ? item.Key?.split('/').pop() : item.Prefix?.split('/').slice(-2, -1)[0];
  const fullPath = isFile ? item.Key : item.Prefix;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="text-left">
          <SheetTitle className="break-all">{name}</SheetTitle>
          <SheetDescription>
            Details for {item.type} in s3://{bucket}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-muted-foreground col-span-1">Name</span>
            <span className="col-span-2 break-all">{name}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-muted-foreground col-span-1">Type</span>
            <span className="capitalize col-span-2">{item.type}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-muted-foreground col-span-1">Full Path</span>
            <span className="col-span-2 break-all">{fullPath}</span>
          </div>
          {isFile && item.Size != null && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-muted-foreground col-span-1">Size</span>
              <span className="col-span-2">{formatBytes(item.Size)}</span>
            </div>
          )}
          {isFile && item.LastModified && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-muted-foreground col-span-1">Last Modified</span>
              <span className="col-span-2">{new Date(item.LastModified).toLocaleString()}</span>
            </div>
          )}
           {isFile && item.StorageClass && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-muted-foreground col-span-1">Storage Class</span>
              <span className="col-span-2">{item.StorageClass}</span>
            </div>
          )}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
