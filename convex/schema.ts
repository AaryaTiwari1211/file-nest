import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define enums
export const fileTypes = v.union(v.literal("image"), v.literal("csv"), v.literal("pdf"));
export const roles = v.union(v.literal("admin"), v.literal("member"));

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.optional(roles),
    createdAt: v.number(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    nameLower: v.string(),
    parentId: v.optional(v.id("folders")),
    isRoot: v.optional(v.boolean()),
    shouldDelete: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_userId_parentId", ["userId", "parentId"])
    .index("by_nameLower", ["nameLower"])
    .index("by_shouldDelete", ["shouldDelete"]),

  files: defineTable({
    name: v.string(),
    nameLower: v.string(),
    type: fileTypes,
    fileId: v.id("_storage"),
    folderId: v.optional(v.id("folders")),
    userId: v.id("users"),
    size: v.optional(v.number()),
    shouldDelete: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_fileId", ["fileId"])
    .index("by_userId_folderId", ["userId", "folderId"])
    .index("by_shouldDelete", ["shouldDelete"]),

  favorites: defineTable({
    fileId: v.id("files"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_userId_fileId", ["userId", "fileId"]),
});
