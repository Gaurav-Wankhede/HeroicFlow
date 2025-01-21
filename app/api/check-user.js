import { checkUser } from "@/lib/checkUser";

export default async function handler(req, res) {
  try {
    const user = await checkUser(req);
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in /api/check-user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
