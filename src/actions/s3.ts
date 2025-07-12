'use server';

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { z } from "zod";
import type { S3ClientConfig } from "@aws-sdk/client-s3";

const S3ConfigSchema = z.object({
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  region: z.string().min(1, { message: "Region is required." }),
  bucket: z.string().min(1, { message: "Bucket name is required." }),
});

type S3Config = z.infer<typeof S3ConfigSchema>;

export async function validateS3Connection(config: S3Config): Promise<{ success: boolean; message: string }> {
  try {
    const validatedConfig = S3ConfigSchema.parse(config);

    const s3ClientOptions: S3ClientConfig = {
      region: validatedConfig.region,
    };

    if (validatedConfig.accessKeyId && validatedConfig.secretAccessKey) {
      s3ClientOptions.credentials = {
        accessKeyId: validatedConfig.accessKeyId,
        secretAccessKey: validatedConfig.secretAccessKey,
      };
    }

    const s3Client = new S3Client(s3ClientOptions);

    const command = new ListObjectsV2Command({
      Bucket: validatedConfig.bucket,
      MaxKeys: 1,
    });

    await s3Client.send(command);

    return { success: true, message: "Connection successful!" };
  } catch (error: any) {
    let errorMessage = "An unknown error occurred.";

    if (error.name === 'NoSuchBucket') {
      errorMessage = `Bucket "${config.bucket}" does not exist in region "${config.region}".`;
    } else if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
      errorMessage = "Invalid AWS Access Key ID or Secret Access Key.";
    } else if (error.code === 'PermanentRedirect') {
      errorMessage = `The bucket is in a different region. Please verify the bucket's region.`;
    } else if (error.name === 'AccessDenied' || error.Code === 'AccessDenied') {
        errorMessage = `Access Denied. If this is a public bucket, leave credentials empty. Otherwise, please check your credentials and bucket permissions.`;
    } else if (error instanceof z.ZodError) {
      errorMessage = "Invalid input data.";
    } else {
       errorMessage = error.message || "Failed to connect to S3.";
    }
    
    console.error("S3 Connection Error:", error);
    return { success: false, message: errorMessage };
  }
}
