import { OrganizationList } from "@clerk/nextjs";

export default function SelectOrganizationPage() {
  return (
    <div className="h-screen flex items-center justify-center">
      <OrganizationList 
        hidePersonal
        afterSelectOrganizationUrl="/(platform)/(dashboard)/organization/:id"
        afterCreateOrganizationUrl="/(platform)/(dashboard)/organization/:id"
        appearance={{
          elements: {
            rootBox: {
              boxShadow: "none",
              width: "100%",
              maxWidth: "600px",
            },
            card: {
              border: "1px solid #e5e7eb",
              boxShadow: "none",
              backgroundColor: "white",
            }
          }
        }}
      />
    </div>
  );
}