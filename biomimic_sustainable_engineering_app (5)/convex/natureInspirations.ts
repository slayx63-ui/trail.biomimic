import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("natureInspirations")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    
    return await ctx.db.query("natureInspirations").collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existing = await ctx.db.query("natureInspirations").first();
    if (existing) return;

    const inspirations = [
      {
        title: "Gecko Feet Adhesion",
        organism: "Gecko",
        mechanism: "Van der Waals forces through microscopic hairs",
        description: "Geckos can climb any surface using millions of tiny hairs called setae that create molecular attraction.",
        engineeringApplications: ["Gecko tape", "Climbing robots", "Medical adhesives", "Space applications"],
        category: "Adhesion",
      },
      {
        title: "Shark Skin Drag Reduction",
        organism: "Shark",
        mechanism: "Dermal denticles create micro-vortices",
        description: "Shark skin reduces drag by up to 10% through tiny tooth-like scales that manage water flow.",
        engineeringApplications: ["Swimsuits", "Ship hulls", "Wind turbine blades", "Aircraft surfaces"],
        category: "Fluid Dynamics",
      },
      {
        title: "Lotus Leaf Self-Cleaning",
        organism: "Lotus",
        mechanism: "Micro and nano-scale surface structures",
        description: "Lotus leaves stay clean through a combination of wax and microscopic bumps that repel water and dirt.",
        engineeringApplications: ["Self-cleaning windows", "Stain-resistant fabrics", "Anti-fouling coatings"],
        category: "Surface Properties",
      },
      {
        title: "Honeycomb Structure",
        organism: "Honeybee",
        mechanism: "Hexagonal tessellation for maximum strength-to-weight ratio",
        description: "Bees create hexagonal cells that use minimal material while providing maximum storage and strength.",
        engineeringApplications: ["Aerospace panels", "Building materials", "Packaging design", "Energy storage"],
        category: "Structural",
      },
      {
        title: "Bird Wing Aerodynamics",
        organism: "Birds",
        mechanism: "Variable wing geometry and feather control",
        description: "Birds adjust wing shape and feather position for optimal lift and maneuverability in different flight conditions.",
        engineeringApplications: ["Morphing aircraft wings", "Wind turbine design", "Drone efficiency"],
        category: "Aerodynamics",
      },
      {
        title: "Cactus Water Collection",
        organism: "Cactus",
        mechanism: "Conical spines and surface gradients",
        description: "Cacti collect water from fog using spines that create droplets and guide them to the base.",
        engineeringApplications: ["Water harvesting systems", "Fog nets", "Desert agriculture"],
        category: "Water Management",
      },
    ];

    for (const inspiration of inspirations) {
      await ctx.db.insert("natureInspirations", inspiration);
    }
  },
});
