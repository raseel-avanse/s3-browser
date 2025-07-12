
"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Bucket {
  id: string;
  name: string;
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  status: 'untested' | 'connected' | 'failed';
}

interface BucketContextType {
  buckets: Bucket[];
  selectedBucket: Bucket | null;
  addBucket: (bucket: Omit<Bucket, 'id'>) => void;
  updateBucket: (id: string, bucket: Omit<Bucket, 'id'>) => void;
  deleteBucket: (id: string) => void;
  setSelectedBucket: (bucket: Bucket | null) => void;
  getBucketById: (id: string) => Bucket | undefined;
  setBucketStatus: (id: string, status: Bucket['status']) => void;
}

const BucketContext = createContext<BucketContextType | undefined>(undefined);

export function BucketProvider({ children }: { children: React.ReactNode }) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
        const storedBuckets = localStorage.getItem('s3-buckets');
        if (storedBuckets) {
            setBuckets(JSON.parse(storedBuckets));
        }
    } catch (e) {
        console.error("Failed to load buckets from localStorage", e);
        setBuckets([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
        try {
            localStorage.setItem('s3-buckets', JSON.stringify(buckets));
        } catch(e) {
            console.error("Failed to save buckets to localStorage", e);
        }
    }
  }, [buckets, isLoaded]);

  const addBucket = (bucket: Omit<Bucket, 'id'>) => {
    const newBucket = { ...bucket, id: crypto.randomUUID() };
    setBuckets(prev => [...prev, newBucket]);
  };

  const updateBucket = (id: string, updatedBucket: Omit<Bucket, 'id'>) => {
    setBuckets(prev => prev.map(b => b.id === id ? { ...updatedBucket, id } : b));
  };

  const deleteBucket = (id: string) => {
    setBuckets(prev => prev.filter(b => b.id !== id));
  };
  
  const getBucketById = (id: string) => {
    return buckets.find(b => b.id === id);
  };

  const setBucketStatus = (id: string, status: Bucket['status']) => {
    setBuckets(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  return (
    <BucketContext.Provider value={{ buckets, selectedBucket, addBucket, updateBucket, deleteBucket, setSelectedBucket, getBucketById, setBucketStatus }}>
      {children}
    </BucketContext.Provider>
  );
}

export function useBucket() {
  const context = useContext(BucketContext);
  if (context === undefined) {
    throw new Error('useBucket must be used within a BucketProvider');
  }
  return context;
}
