"use client";

import { useState } from 'react';
import S3Browser from '@/components/s3-browser';
import { type S3Config } from '@/components/credentials-form';

export default function Home() {
  // Dummy config to render the browser directly for preview
  const [config, setConfig] = useState<S3Config>({
    bucket: "example-bucket",
    region: "us-east-1",
  });

  const handleDisconnect = () => {
    // In a real app, this would clear credentials.
    // For this preview, we can just log it.
    console.log("Disconnected");
    // To re-enable the form, you could setConfig(null)
  };
  
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <S3Browser config={config} onDisconnect={handleDisconnect} useDummyData={true} />
    </main>
  );
}
