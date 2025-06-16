import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  query,
} from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export async function getUser(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
): Promise<Doc<"users">> {
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new ConvexError("Expected user to be defined");
  }

  return user;
}

export const createUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    image: v.string(),
    email: v.optional(v.string()),
  },
  async handler(ctx, args) {
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      image: args.image,
      email: args.email,
      createdAt: Date.now(),
      role: "member",
    });
  },
});

export const updateUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    image: v.string(),
    email: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new ConvexError("No user with this token found");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      image: args.image,
      email: args.email,
    });
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);

    return user
      ? { name: user.name, image: user.image }
      : { name: "Unknown", image: null };
  },
});

export const getMe = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    try {
      const user = await getUser(ctx, identity.tokenIdentifier);
      return user;
    } catch {
      return null;
    }
  },
});
