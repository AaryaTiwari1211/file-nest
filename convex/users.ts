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
    console.error(`User not found: ${tokenIdentifier}`);
    throw new ConvexError("User not found.");
  }

  return user;
}

export const createUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    tenantId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();

    if (existingUser) {
      throw new ConvexError("User already exists.");
    }

    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      image: args.image ?? "",
      email: args.email ?? "",
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      role: "member",
      status: "active",
      tenantId: args.tenantId ?? "default",
      permissions: ["read", "upload"],
    });
  },
});

export const updateUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier);

    await ctx.db.patch(user._id, {
      ...(args.name && { name: args.name }),
      ...(args.image && { image: args.image }),
      ...(args.email && { email: args.email }),
      lastLoginAt: Date.now(),
    });
  },
});

export const deleteUser = internalMutation({
  args: { tokenIdentifier: v.string() },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier);

    await ctx.db.delete(user._id);
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);

    return user
      ? {
          name: user.name,
          image: user.image,
          email: user.email,
          role: user.role,
          status: user.status,
        }
      : { name: "Unknown", image: null, role: "N/A", status: "inactive" };
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

export const updateLoginTimestamp = internalMutation({
  args: { tokenIdentifier: v.string() },
  async handler(ctx, args) {
    const user = await getUser(ctx, args.tokenIdentifier);

    await ctx.db.patch(user._id, {
      lastLoginAt: Date.now(),
    });
  },
});
