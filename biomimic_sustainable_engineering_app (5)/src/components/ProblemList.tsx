import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { SolutionModal } from "./SolutionModal";

export function ProblemList() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  
  const problems = useQuery(api.problems.list, { 
    category: selectedCategory || undefined 
  });
  const generateSolution = useAction(api.solutions.generateAISolution);

  const categories = ["Energy", "Water Management", "Materials", "Transportation", "Agriculture", "Waste Management", "Construction", "Manufacturing"];

  const handleGenerateSolution = async (problemId: string) => {
    try {
      toast.promise(
        generateSolution({ problemId: problemId as Id<"problems"> }),
        {
          loading: "Generating biomimicry solution...",
          success: "AI solution generated successfully!",
          error: "Failed to generate solution",
        }
      );
    } catch (error) {
      console.error("Error generating solution:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "solved": return "bg-gray-100 text-black";
      case "in_progress": return "bg-gray-50 text-gray-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-2xl font-bold" style={{ fontFamily: 'Newake, sans-serif', color: 'black' }}>Sustainability Challenges</h3>
        <select
          value={selectedCategory}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          style={{ fontFamily: 'Newake, sans-serif', color: 'black' }}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {problems === undefined ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-12">
          <h4 className="text-xl font-semibold text-gray-600 mb-2">No problems found</h4>
          <p className="text-gray-500">Be the first to submit a sustainability challenge!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <div key={problem._id} className="solution-card bg-white border border-gray-200 rounded p-6 hover:border-black transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(problem.status)}`}>
                  {problem.status.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500">{problem.solutionsCount} solutions</span>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{problem.title}</h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{problem.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <span className="px-2 py-1 bg-gray-100 text-black rounded-full text-xs">
                  {problem.category}
                </span>
                {problem.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>By {problem.submitterName}</span>
                <span>{new Date(problem._creationTime).toLocaleDateString()}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProblem(problem._id)}
                  className="flex-1 px-3 py-2 bg-gray-50 text-black rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  View Solutions
                </button>
                <button
                  onClick={() => handleGenerateSolution(problem._id)}
                  className="px-3 py-2 bg-black text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  AI
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProblem && (
        <SolutionModal
          problemId={selectedProblem}
          onClose={() => setSelectedProblem(null)}
        />
      )}
    </div>
  );
}
