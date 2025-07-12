"use client";

import { useState, useEffect } from 'react';
import { CredentialsForm, type S3Config } from '@/components/credentials-form';
import S3Browser from '@/components/s3-browser';

export default function Home() {
  const [config, setConfig] = useState<S3Config | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedConfig = localStorage.getItem('s3-config');
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
      }
    } catch (error) {
      console.error("Failed to parse S3 config from localStorage", error);
      // If parsing fails, it's good practice to clear the invalid item.
      localStorage.removeItem('s3-config');
    }
  }, []);

  const handleConnect = (newConfig: S3Config) => {
    localStorage.setItem('s3-config', JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('s3-config');
    setConfig(null);
  };
  
  if (!isClient) {
    // Render nothing or a loading spinner on the server to avoid hydration mismatch
    return null;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      {config ? (
        <S3Browser config={config} onDisconnect={handleDisconnect} />
      ) : (
        <CredentialsForm onConnect={handleConnect} />
      )}
    </main>
  );
}
