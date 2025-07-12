"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { validateS3Connection } from "@/actions/s3";
import { useToast } from "@/hooks/use-toast";
import type { Bucket } from "@/context/BucketContext";

const formSchema = z.object({
  name: z.string().min(1, { message: "Bucket alias is required." }),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  region: z.string().min(1, { message: "Region is required." }),
  bucket: z.string().min(1, { message: "Bucket name is required." }),
});

export type S3Config = Omit<Bucket, 'id'>;

interface CredentialsFormProps {
  onSave: (config: S3Config) => void;
  onCancel: () => void;
  initialData?: S3Config;
  isEditing?: boolean;
}

export function CredentialsForm({ onSave, onCancel, initialData, isEditing = false }: CredentialsFormProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const form = useForm<S3Config>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      accessKeyId: "",
      secretAccessKey: "",
      region: "",
      bucket: "",
    },
  });

  async function onSubmit(values: S3Config) {
    setIsConnecting(true);
    const result = await validateS3Connection(values);
    setIsConnecting(false);

    if (result.success) {
      onSave(values);
      toast({
        title: isEditing ? "Bucket Updated" : "Bucket Added",
        description: `Successfully connected and saved "${values.name}".`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: result.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alias</FormLabel>
              <FormControl>
                <Input placeholder="My Work Bucket" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="bucket"
          render={({ field }) => (
            <FormItem>
              <FormLabel>S3 Bucket Name</FormLabel>
              <FormControl>
                <Input placeholder="my-awesome-bucket" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AWS Region</FormLabel>
              <FormControl>
                <Input placeholder="us-east-1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessKeyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AWS Access Key ID <span className="text-muted-foreground">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="AKIA..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secretAccessKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AWS Secret Access Key <span className="text-muted-foreground">(optional)</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    placeholder="Your secret key"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full"
                    onClick={() => setShowSecret(!showSecret)}
                    aria-label={showSecret ? "Hide secret key" : "Show secret key"}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isConnecting}>
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Bucket'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
