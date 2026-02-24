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
    <div className="relative aspect-[3/1] mb-12 overflow-hidden rounded-2xl shadow-xl group">
      <Image
        src="/featured.png"
        alt="Featured Product"
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center transition-opacity duration-300">
        <div className="pl-8 md:pl-16 max-w-md transform transition-all duration-500 translate-y-0 opacity-100">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 drop-shadow-sm">
            {isAuthenticated ? "Welcome Back!" : "Discover Your Style"}
          </h1>
          <p className="text-sm md:text-lg text-gray-200 mb-8 font-light tracking-wide">
            {isAuthenticated
              ? "Check out our latest arrivals and exclusive deals."
              : "Join thousands of fashion lovers. Sign up today!"}
          </p>
          {isAuthenticated ? (
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-900 font-semibold px-8 py-3 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] transition-all duration-300 hover:-translate-y-1"
            >
              Shop Now
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-900 font-semibold px-8 py-3 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] transition-all duration-300 hover:-translate-y-1"
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
