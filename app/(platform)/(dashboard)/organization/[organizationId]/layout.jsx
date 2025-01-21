import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/header"), {
  ssr: false
});

export default async function OrganizationLayout({ children }) {
  const { orgId } = auth();
  const user = await currentUser();

  if (!user || !orgId) {
    redirect("/select-org");
  }

  return (
    <div className="h-full">
      <Header />
      <main className="pt-20 h-full bg-slate-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
