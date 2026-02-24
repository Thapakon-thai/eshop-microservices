import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { Bell, Home, ShoppingCart } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import { UserNav } from "./UserNav";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full flex items-center justify-between border-b border-gray-200/50 pb-4 pt-4 px-6 mb-8 bg-white/70 backdrop-blur-lg shadow-sm transition-all duration-300 dark:bg-zinc-950/70 dark:border-zinc-800">
      {/* LEFT */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative overflow-hidden rounded-full p-1 transition-transform duration-300 group-hover:scale-110">
          <Image
            src="/logo.png"
            alt="Trendfit"
            width={36}
            height={36}
            className="w-6 h-6 md:w-9 md:h-9"
          />
        </div>
        <h2 className="hidden md:block text-md font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
          TRENDFIT.
        </h2>
      </Link>
      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <SearchBar />
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Home className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform hover:scale-110" />
        </Link>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform hover:scale-110" />
        </button>
        <ShoppingCartIcon />
        <UserNav />
      </div>
    </nav>
  );
};

export default Navbar;
