import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || orgId;

    if (!organizationId) {
      return new Response("Organization ID is required", { status: 400 });
    }

    // Get all summaries for the organization, sorted by date in descending order
    const summaries = await prisma.dailySummary.findMany({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        date: 'desc'
      },
      take: 30
    });

    return new Response(JSON.stringify({ summaries }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Failed to fetch summaries:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
