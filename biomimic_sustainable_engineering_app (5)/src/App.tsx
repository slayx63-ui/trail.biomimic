import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { ProblemSubmission } from "./components/ProblemSubmission";
import { NatureExplorer } from "./components/NatureExplorer";
import { SolutionGallery } from "./components/SolutionGallery";
import { ChatInterface } from "./components/ChatInterface";
import { ProblemList } from "./components/ProblemList";

type Tab = "problems" | "submit" | "nature" | "gallery" | "chat";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("problems");

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="grunge-bg"></div>
      <header className="sticky top-0 z-20 border-b border-gray-600 relative" style={{ backgroundColor: '#303d2b' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Newake, sans-serif', color: '#508033' }}>BioMimic</h1>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <Content activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-[6rem] font-black tracking-[.035] mb-8" style={{ fontFamily: 'Bowlby One SC, cursive' }}>
          <span style={{ color: '#508033' }}>NATURE INSPIRED</span>
          <br />
          <span style={{ color: '#fcffe6' }}>ENGINEERING SOLUTIONS</span>
        </h2>
        <Authenticated>
          <p className="text-lg text-white mb-8 leading-relaxed" style={{ fontFamily: 'Newake, sans-serif' }}>
            Welcome back, {loggedInUser?.name || loggedInUser?.email || "Engineer"}! 
            <br />Discover how nature solves complex problems.
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-lg text-white mb-8 leading-relaxed" style={{ fontFamily: 'Newake, sans-serif' }}>
            Sign in to submit problems and collaborate on biomimicry solutions
          </p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="bg-white border border-gray-200 overflow-hidden relative">
          <div className="grunge-bg"></div>
          <nav className="flex border-b border-gray-200 relative z-10">
            {[
              { id: "problems", label: "👾PROBLEMS" },
              { id: "submit", label: "☑️SUBMIT" },
              { id: "nature", label: "🔍EXPLORER" },
              { id: "gallery", label: "🎑GALLERY" },
              { id: "chat", label: "🤖ASSISTANT" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "bg-white border-black"
                    : "text-gray-500 hover:bg-gray-50 border-transparent"
                }`}
                style={{ fontFamily: 'Newake, sans-serif', color: activeTab === tab.id ? '#508033' : '#508033' }}
              >
                <span className="hidden sm:inline" style={{ fontFamily: 'Newake, sans-serif' }}>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-8 relative z-10">
            {activeTab === "problems" && <ProblemList />}
            {activeTab === "submit" && <ProblemSubmission />}
            {activeTab === "nature" && <NatureExplorer />}
            {activeTab === "gallery" && <SolutionGallery />}
            {activeTab === "chat" && <ChatInterface />}
          </div>
        </div>
      </Authenticated>
    </div>
  );
}
