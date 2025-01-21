"use client";

import React from "react";
import { useTheme } from "next-themes";

const Layout = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
