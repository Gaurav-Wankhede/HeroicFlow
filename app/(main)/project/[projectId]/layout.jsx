import { Suspense } from "react";

export default async function ProjectLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600"></div>
              <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-blue-500 dark:border-blue-400 rounded-full animate-spin"></div>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}