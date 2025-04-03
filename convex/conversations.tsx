import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
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
      throw new Error("User Not Found");
    }
    const conversationMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    console.log(
      "✅ Conversation Memberships for User:",
      conversationMemberships
    );

    if (conversationMemberships.length === 0) {
      console.warn("⚠️ No conversations found for this user.");
      return [];
    }

    const conversations = await Promise.all(
        conversationMemberships.map(async (membership) => {
          const conversation = await ctx.db.get(membership.conversationId);
          if (!conversation) {
            console.warn("⚠️ Conversation Not Found:", membership.conversationId);
            return null;
          }
          return conversation;
        })
      );
      
     
      const validConversations = conversations.filter((c) => c !== null);
      console.log("✅ Conversations Fetched:", validConversations);
      
      if (validConversations.length === 0) {
        console.warn("⚠️ No valid conversations found.");
        return [];
      }
      
    const converstionWithDetails = await Promise.all(
      conversations.map(async (conversation, index) => {
        if(conversation){
            const allConversationMemberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId", (q) =>
              q.eq("conversationId", conversation?._id)
            )
            .collect();
  
          if (conversation?.isGroup) {
            return { conversation };
          } else {
            const otherMembership = allConversationMemberships.filter(
              (membership) => membership.memberId !== currentUser._id
            )[0];
            const otherMember = await ctx.db.get(otherMembership.memberId);
            return {
              conversation,
              otherMember,
            };
          }
        }
        
      })
    );
    return converstionWithDetails;
  },
});
