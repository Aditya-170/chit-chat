import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";

const validatePayload = async (req: Request): Promise<WebhookEvent | undefined> => {
  const payload = await req.text();

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET! || ""); 

  try {
    const event = webhook.verify(payload, svixHeaders) as WebhookEvent;
    return event;
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return;
  }
};

const handleClerkWebhook = httpAction(async (ctx, req) => {
  const event = await validatePayload(req);
  if (!event) {
    return new Response("Could not validate request", { status: 400 });
  }
  // console.log("event type ", event.type);
  switch (event.type) {
    case "user.updated": {
      const user = await ctx.runQuery(internal.user.gett, { clerkId: event.data.id });
      console.log("abcj ",user);
      if (user) {
        console.log(`Updating user ${event.data.id} with ${JSON.stringify(event.data)}`);
      }
      break;
    }
    case "user.created": {
      console.log("Creating user:", event.data.id);
      
      const user = await ctx.runQuery(internal.user.get, { email: event.data.email_addresses[0].email_address });
    
      if (user) {
        console.log(`User already exists: ${user.clerkId}`);
      } else {
        await ctx.runMutation(internal.user.create, {
          username: `${event.data.first_name} ${event.data.last_name}`,
          imageUrl: event.data.image_url,
          clerkId: event.data.id,
          email: event.data.email_addresses[0].email_address,
        });
      }
      break;
    }    
    default: {
      console.log("Unsupported Clerk webhook event:", event.type);
    }
  }
  return new Response(null, { status: 200 });
});

const http = httpRouter();
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
