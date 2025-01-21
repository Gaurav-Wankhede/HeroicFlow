"use client"

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon, PenBox } from 'lucide-react';
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useOrganization } from "@clerk/nextjs";

const UserMenu = dynamic(() => import("./user-menu"), {
  ssr: false,
  loading: () => (
    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
  ),
});

function Header() {
  const { theme, setTheme } = useTheme();
  const { organization } = useOrganization();
  const [mounted, setMounted] = useState(false);

  // Only show theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-opacity-70 backdrop-filter backdrop-blur-lg transition-colors duration-300 dark:bg-gray-900/70 bg-white/70 border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto py-4 px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src={theme === 'dark' ? "/logo3.png" : "/logo3.png"}
            alt="HeroicFlow Logo"
            width={150}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link href={`/organization/${organization?.id}`}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
            >
              <PenBox size={16} />
              <span className="hidden sm:inline">Admin Dashboard</span>
            </Button>
          </Link>
          <Link href={`/project/create`}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
            >
              <PenBox size={16} />
              <span className="hidden sm:inline">Create Project</span>
            </Button>
          </Link>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-700" />
              )}
            </Button>
          )}

          <SignedIn>
            <UserMenu />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors duration-200">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}

export default Header;