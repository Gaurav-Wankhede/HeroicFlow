import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import "react-day-picker/dist/style.css";
import { Toaster } from "sonner";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HeroicFlow",
  description: "",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} animated-dotted-background`}>
        <ClerkProvider
          appearance={{
            baseTheme: shadesOfPurple,
            variables: {
              colorPrimary: "#3b82f6",
              colorBackground: "#1a202c",
              colorInputBackground: "#2D3748",
              colorInputText: "#F3F4F6",
            },
            elements: {
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
              card: "bg-gray-800",
              headerTitle: "text-blue-400",
              headerSubtitle: "text-gray-400",
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system">
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
            <Footer />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
