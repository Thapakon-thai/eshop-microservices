"use client";

import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const HeroBanner = () => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
  }, [checkAuth]);

  if (!isMounted) {
    return (
      <div className="relative aspect-[3/1] mb-12">
        <Image src="/featured.png" alt="Featured Product" fill />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/1] mb-12">
      <Image src="/featured.png" alt="Featured Product" fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
        <div className="pl-8 md:pl-16 max-w-md">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
            {isAuthenticated ? "Welcome Back!" : "Discover Your Style"}
          </h1>
          <p className="text-sm md:text-base text-gray-200 mb-6">
            {isAuthenticated
              ? "Check out our latest arrivals and exclusive deals."
              : "Join thousands of fashion lovers. Sign up today!"}
          </p>
          {isAuthenticated ? (
            <Link
              href="/products"
              className="inline-block bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Shop Now
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="inline-block bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
