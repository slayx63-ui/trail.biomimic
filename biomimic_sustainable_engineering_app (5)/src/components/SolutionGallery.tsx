import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function SolutionGallery() {
  const solutions = useQuery(api.solutions.listPopular);
  const toggleLike = useMutation(api.solutions.toggleLike);

  const handleLike = async (solutionId: string) => {
    try {
      await toggleLike({ solutionId: solutionId as Id<"solutions"> });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-black">Solution Gallery</h3>
        <p className="text-gray-600 mt-1">Browse and like innovative nature-inspired solutions</p>
      </div>

      {solutions === undefined ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : solutions.length === 0 ? (
        <div className="text-center py-12">
          <h4 className="text-xl font-semibold text-gray-600 mb-2">No solutions yet</h4>
          <p className="text-gray-500">Submit a problem to generate the first AI solution!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {solutions.map((solution) => (
            <div key={solution._id} className="solution-card bg-white border border-gray-200 rounded p-6 hover:border-black transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{solution.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Problem: {solution.problemTitle}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{solution.submitterName}</span>
                    {solution.generatedBy === "ai" && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        AI Generated
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleLike(solution._id)}
                  className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-600">Like</span>
                  <span className="text-sm text-gray-600">{solution.likes}</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h6 className="font-medium text-gray-700 text-sm mb-1">Nature Inspiration</h6>
                  <p className="text-gray-600 text-sm">{solution.natureInspiration}</p>
                </div>

                <div>
                  <h6 className="font-medium text-gray-700 text-sm mb-1">Biomimicry Principle</h6>
                  <p className="text-gray-600 text-sm">{solution.biomimicryPrinciple}</p>
                </div>

                <div>
                  <h6 className="font-medium text-gray-700 text-sm mb-1">Description</h6>
                  <p className="text-gray-600 text-sm line-clamp-3">{solution.description}</p>
                </div>

                <div>
                  <h6 className="font-medium text-gray-700 text-sm mb-2">Key Benefits</h6>
                  <div className="flex flex-wrap gap-1">
                    {solution.benefits.slice(0, 3).map((benefit, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {benefit}
                      </span>
                    ))}
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
