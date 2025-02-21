import { Webhook } from 'svix';
import { buffer } from 'micro';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const payload = await buffer(req);
    const headerPayload = req.headers;

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    try {
      const event = webhook.verify(payload, headerPayload);

      if (event.type === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;

        await prisma.user.create({
          data: {
            clerkUserId: id,
            email: email_addresses[0].email_address,
            name: `${first_name} ${last_name}`,
            imageUrl: image_url,
          },
        });
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(400).json({ message: 'Error processing webhook' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
} 