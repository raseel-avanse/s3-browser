'use server';

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { z } from "zod";

const S3ConfigSchema = z.object({
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  region: z.string(),
  bucket: z.string(),
});

type S3Config = z.infer<typeof S3ConfigSchema>;

export async function validateS3Connection(config: S3Config): Promise<{ success: boolean; message: string }> {
  try {
    S3ConfigSchema.parse(config);

    const s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: config.bucket,
      MaxKeys: 1, // We only need to check if we can access it, no need to list all objects
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
    } else if (error instanceof z.ZodError) {
      errorMessage = "Invalid input data.";
    } else {
       errorMessage = error.message || "Failed to connect to S3.";
    }
    
    console.error("S3 Connection Error:", error);
    return { success: false, message: errorMessage };
  }
}
