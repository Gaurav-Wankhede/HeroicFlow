"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(organizationId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the organization details
  const organization = await clerkClient().organizations.getOrganization({
    slug: organizationId,
  });

  if (!organization) {
    return null;
  }

  // Check if user belongs to this organization
  const { data: membership } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  const userMembership = membership.find(
    (member) => member.publicUserData.userId === userId
  );

  // If user is not a member, return null
  if (!userMembership) {
    return null;
  }

  return organization;
}

export async function getProjects(organizationId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const projects = await prisma.project.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

export async function getUserIssues(userId) {
  const { organizationId } = auth();

  if (!userId || !organizationId) {
    throw new Error("No user id or organization id found");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issues = await prisma.issue.findMany({
    where: {
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
      project: {
        organizationId,
      },
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

export async function getOrganizationUsers(organizationId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const organizationMemberships =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId,
    });

  const userIds = organizationMemberships.data.map(
    (membership) => membership.publicUserData.userId
  );

  const users = await prisma.user.findMany({
    where: {
      clerkUserId: {
        in: userIds,
      },
    },
  });

  return users;
}
