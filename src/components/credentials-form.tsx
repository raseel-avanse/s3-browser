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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  accessKeyId: z.string().min(1, { message: "Access Key ID is required." }),
  secretAccessKey: z.string().min(1, { message: "Secret Access Key is required." }),
  region: z.string().min(1, { message: "Region is required." }),
  bucket: z.string().min(1, { message: "Bucket name is required." }),
});

export type S3Config = z.infer<typeof formSchema>;

interface CredentialsFormProps {
  onConnect: (config: S3Config) => void;
}

export function CredentialsForm({ onConnect }: CredentialsFormProps) {
  const [showSecret, setShowSecret] = useState(false);

  const form = useForm<S3Config>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accessKeyId: "",
      secretAccessKey: "",
      region: "",
      bucket: "",
    },
  });

  function onSubmit(values: S3Config) {
    onConnect(values);
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">S3 Navigator</CardTitle>
        <CardDescription>Enter your AWS credentials and bucket name to connect.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accessKeyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Access Key ID</FormLabel>
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
                  <FormLabel>AWS Secret Access Key</FormLabel>
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
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Connect
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
