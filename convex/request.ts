import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const create = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorised user");
    }

    if (identity.email === args.email) {
      throw new ConvexError("can't send a request to yourself");
    }
    let currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });
    if (!currentUser) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email as string))
        .unique();
    }
    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    const receiver = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!receiver) {
      throw new ConvexError("Receiver not found");
    }
    const existingRequest = await ctx.db
      .query("requests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("sender", currentUser._id).eq("receiver", receiver._id)
      )
      .unique();
    if (existingRequest) {
      throw new ConvexError("Request already sent");
    }
    const requestAlreadyReceived = await ctx.db
      .query("requests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("sender", receiver._id).eq("receiver", currentUser._id)
      )
      .unique();
    if (requestAlreadyReceived) {
      throw new ConvexError("Request already received");
    }

    const friends1=await ctx.db.query("friends")
    .withIndex("by_user1",(q)=>q.eq("user1",currentUser._id))
    .collect();
    const friends2=await ctx.db.query("friends")
    .withIndex("by_user2",(q)=>q.eq("user2",currentUser._id))
    .collect();

    if(friends1.some((friend)=>friend.user2===receiver._id)||
    friends2.some((friend)=>friend.user1===receiver._id)){
      throw new ConvexError("you are already friend with user")
    }

    const request = await ctx.db.insert("requests", {
      sender: currentUser._id,
      receiver: receiver._id,
    });
    return request;
  },
});

export const deny = mutation({
  args: {
    id: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorised user");
    }

    let currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });
    if (!currentUser) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email as string))
        .unique();
    }
    if (!currentUser) {
      throw new ConvexError("User not found");
    }
    const request = await ctx.db.get(args.id);
    if (!request || request.receiver !== currentUser._id) {
      throw new ConvexError("Request Error in deny ");
    }

    await ctx.db.delete(request._id);
  },
});

export const accept =mutation({
  args:{
    id:v.id("requests")
  },handler:async(ctx,args)=>{
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorised user");
    }

    let currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });
    if (!currentUser) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email as string))
        .unique();
    }
    if (!currentUser) {
      throw new ConvexError("User not found");
    }
    const request =await ctx.db.get(args.id);
    if(!request || request.receiver!==currentUser._id){
      throw new ConvexError("there was an error while receiving request");
    }

    const conversationId=await ctx.db.insert("conversations",{
      isGroup:false
    })
    await ctx.db.insert("friends",{
      user1:currentUser._id,
      user2:request.sender,
      conversationId,
    });

    await ctx.db.insert("conversationMembers",{
      memberId:currentUser._id,
      conversationId
    });
    await ctx.db.insert("conversationMembers",{
      memberId:request.sender,
      conversationId
    });
    await ctx.db.delete(request._id);
  },
});
