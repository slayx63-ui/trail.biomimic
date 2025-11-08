import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export function NatureExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const inspirations = useQuery(api.natureInspirations.list, {
    category: selectedCategory || undefined
  });
  const seedData = useMutation(api.natureInspirations.seed);

  useEffect(() => {
    // Seed the nature inspirations data
    seedData();
  }, [seedData]);

  const categories = ["Adhesion", "Fluid Dynamics", "Surface Properties", "Structural", "Aerodynamics", "Water Management"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black">Nature's Engineering Solutions</h3>
          <p className="text-gray-600 mt-1">Discover how nature solves complex engineering problems</p>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {inspirations === undefined ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : inspirations.length === 0 ? (
        <div className="text-center py-12">
          <h4 className="text-xl font-semibold text-gray-600 mb-2">No inspirations found</h4>
          <p className="text-gray-500">Check back soon for nature-inspired solutions!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {inspirations.map((inspiration) => (
            <div key={inspiration._id} className="solution-card bg-white border border-gray-200 rounded overflow-hidden hover:border-black transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-gray-100 text-black rounded-full text-sm font-medium">
                    {inspiration.category}
                  </span>
                </div>
                
                <h4 className="font-bold text-gray-900 mb-2">{inspiration.title}</h4>
                <p className="text-sm text-gray-600 font-medium mb-3">
                  Organism: {inspiration.organism}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h6 className="font-medium text-gray-700 text-sm mb-1">Mechanism</h6>
                    <p className="text-gray-600 text-sm">{inspiration.mechanism}</p>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-gray-700 text-sm mb-1">Description</h6>
                    <p className="text-gray-600 text-sm">{inspiration.description}</p>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-gray-700 text-sm mb-2">Engineering Applications</h6>
                    <div className="flex flex-wrap gap-1">
                      {inspiration.engineeringApplications.map((app, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
