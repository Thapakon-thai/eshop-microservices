import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mt-24 relative overflow-hidden bg-zinc-950 px-8 py-12 rounded-3xl shadow-2xl mb-8 border border-zinc-800 group">
      {/* Decorative Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 opacity-80" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-150" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-12 text-zinc-400">
        <div className="flex flex-col gap-5 items-center md:items-start max-w-sm">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
              <Image src="/logo.png" alt="Trendfit" width={32} height={32} />
            </div>
            <p className="text-xl font-bold tracking-widest text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              TRENDFIT.
            </p>
          </Link>
          <p className="text-sm text-center md:text-left leading-relaxed">
            Leading fashion destination for the modern lifestyle. Elevate your
            wardrobe with our premium collections.
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            © 2026 Trendfit. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">All rights reserved.</p>
        </div>
        <div className="flex flex-col gap-3 text-sm items-center md:items-start">
          <p className="text-white font-semibold mb-2 tracking-wide text-xs uppercase">
            Company
          </p>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Homepage
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Contact
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Terms of Service
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="flex flex-col gap-3 text-sm items-center md:items-start">
          <p className="text-white font-semibold mb-2 tracking-wide text-xs uppercase">
            Shop
          </p>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            All Products
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            New Arrivals
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Best Sellers
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Sale
          </Link>
        </div>
        <div className="flex flex-col gap-3 text-sm items-center md:items-start">
          <p className="text-white font-semibold mb-2 tracking-wide text-xs uppercase">
            Explore
          </p>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            About Us
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Careers
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Blog
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors hover:translate-x-1 duration-200"
          >
            Affiliate Program
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
