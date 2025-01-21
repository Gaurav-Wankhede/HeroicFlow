"use client";

import { usePathname } from "next/navigation";
import {
  OrganizationSwitcher,
  SignedIn,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useTheme } from "next-themes";

const OrgSwitcher = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const pathname = usePathname();
  const { theme } = useTheme();

  if (pathname === "/" || !isLoaded || !isUserLoaded) {
    return null;
  }

  return (
    <div className="flex justify-end mt-1">
      <SignedIn>
        <OrganizationSwitcher
          hidePersonal
          createOrganizationMode={
            pathname === "/onboarding" ? "navigation" : "modal"
          }
          afterCreateOrganizationUrl="/organization/:slug"
          afterSelectOrganizationUrl="/organization/:slug"
          createOrganizationUrl="/onboarding"
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                `border rounded-md px-5 py-2 ${theme === "dark" ? "border-gray-700 text-gray-300" : "border-gray-300 text-gray-700"}`,
              organizationSwitcherTriggerIcon:
                `${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
              organizationSwitcherPopoverCard:
                `${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`,
              organizationSwitcherPopoverCardList:
                `${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
            },
          }}
        />
      </SignedIn>
    </div>
  );
};

export default OrgSwitcher;
