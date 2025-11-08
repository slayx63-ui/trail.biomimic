import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface SolutionModalProps {
  problemId: string;
  onClose: () => void;
}

export function SolutionModal({ problemId, onClose }: SolutionModalProps) {
  const problem = useQuery(api.problems.get, { id: problemId as Id<"problems"> });
  const solutions = useQuery(api.solutions.listByProblem, { problemId: problemId as Id<"problems"> });
  const toggleLike = useMutation(api.solutions.toggleLike);

  const handleLike = async (solutionId: string) => {
    try {
      await toggleLike({ solutionId: solutionId as Id<"solutions"> });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Solutions</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {problem && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-black mb-2">{problem.title}</h4>
              <p className="text-gray-600 text-sm">{problem.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>Category: {problem.category}</span>
                <span>By: {problem.submitterName}</span>
              </div>
            </div>
          )}

          <div className="p-6">
            {solutions === undefined ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : solutions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No solutions yet. Be the first to contribute!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {solutions.map((solution) => (
                  <div key={solution._id} className="border border-gray-200 rounded p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">{solution.title}</h5>
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
                        className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-600">Like</span>
                        <span className="text-sm text-gray-600">{solution.likes}</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">Nature Inspiration</h6>
                        <p className="text-gray-600 text-sm">{solution.natureInspiration}</p>
                      </div>

                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">Biomimicry Principle</h6>
                        <p className="text-gray-600 text-sm">{solution.biomimicryPrinciple}</p>
                      </div>

                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">Description</h6>
                        <p className="text-gray-600 text-sm">{solution.description}</p>
                      </div>

                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">Implementation</h6>
                        <p className="text-gray-600 text-sm">{solution.implementation}</p>
                      </div>

                      <div>
                        <h6 className="font-medium text-gray-700 mb-2">Benefits</h6>
                        <ul className="list-disc list-inside space-y-1">
                          {solution.benefits.map((benefit, index) => (
                            <li key={index} className="text-gray-600 text-sm">{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
