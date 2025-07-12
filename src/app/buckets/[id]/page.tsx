"use client";

import { useBucket } from "@/context/BucketContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import S3Browser from "@/components/s3-browser";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function BucketBrowserPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { getBucketById, setSelectedBucket } = useBucket();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const bucketId = typeof id === 'string' ? id : '';
    const bucket = getBucketById(bucketId);

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isAuthLoading, router]);

    useEffect(() => {
        if (!isAuthLoading && isAuthenticated && !bucket) {
            // If bucket not found, maybe redirect to the buckets list
            router.push('/');
        }
    }, [bucket, isAuthenticated, isAuthLoading, router]);


    const handleDisconnect = () => {
        setSelectedBucket(null);
        router.push('/');
    };

    if (isAuthLoading || !bucket) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-2">
            <S3Browser config={bucket} onDisconnect={handleDisconnect} />
        </main>
    );
}
