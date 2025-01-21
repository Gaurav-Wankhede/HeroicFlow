import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const checkUser = async (req) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return null;
    }

    const loggedInUser = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // Get user details from Clerk
    const { user } = getAuth(req);

    // Create new user if they don't exist
    const newUser = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
};