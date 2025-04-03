import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const get =query({
    args:{},
    handler:async(ctx,args) =>{
        const identity=await ctx.auth.getUserIdentity();
        if(!identity){
           throw new Error("Unauthorized")
        }
        let currentUser=await getUserByClerkId({
            ctx,clerkId:identity.subject
        })
        if (!currentUser) {
            currentUser= await ctx.db
              .query("users")
              .withIndex("by_email", (q) => q.eq("email", identity.email as string))
              .unique();
          }
        if(!currentUser){
            throw new Error("User Not Found")
        }
        const requests=await ctx.db
        .query('requests')
        .withIndex("by_receiver", (b)=> b.eq(
            "receiver",currentUser._id
        ))
        .collect();
        const requestWithSender= await Promise.all(requests.map(async (request)=>{
            const sender=await ctx.db.get(request.sender);
            if(!sender){
                throw new ConvexError("Request sender not found")
            }
            return {sender,request}
        }))
        return requestWithSender;
    },
})

export const count=query({
    args:{},
    handler:async(ctx,args) =>{
        const identity=await ctx.auth.getUserIdentity();
        if(!identity){
           throw new Error("Unauthorized")
        }
        let currentUser=await getUserByClerkId({
            ctx,clerkId:identity.subject
        })
        if (!currentUser) {
            currentUser= await ctx.db
              .query("users")
              .withIndex("by_email", (q) => q.eq("email", identity.email as string))
              .unique();
          }
        if(!currentUser){
            throw new Error("User Not Found")
        }
        const requests=await ctx.db
        .query('requests')
        .withIndex("by_receiver", (b)=> b.eq(
            "receiver",currentUser._id
        ))
        .collect();
        return requests.length;
},
})