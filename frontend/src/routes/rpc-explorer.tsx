import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { orpcClient } from "@/lib/orpc-client";

export const Route = createFileRoute("/rpc-explorer")({
  component: RPCExplorer,
});

function RPCExplorer() {
  const [selectedProcedure, setSelectedProcedure] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Access router metadata using $ symbol
  const routerMetadata = JSON.stringify(orpcClient, null, 2);

  // Define available procedures
  const procedures = {
    "projects.getAll": {
      description: "Get all projects",
      input: null,
      execute: async () => await orpcClient.projects.getAll(),
    },
    "projects.getById": {
      description: "Get project by ID",
      input: { id: 2 },
      execute: async (input: any) => await orpcClient.projects.getById(input),
    },
    "projects.create": {
      description: "Create a new project",
      input: { name: "Test Project", description: "A test project" },
      execute: async (input: any) => await orpcClient.projects.create(input),
    },
    "tasks.getAll": {
      description: "Get all tasks",
      input: null,
      execute: async () => await orpcClient.tasks.getAll(),
    },
    "comments.getAll": {
      description: "Get all comments",
      input: null,
      execute: async () => await orpcClient.comments.getAll(),
    },
  };

  const handleExecute = async (procedureKey: string) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const procedure = procedures[procedureKey as keyof typeof procedures];
      const data = await procedure.execute(procedure.input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 oRPC Explorer
          </h1>
          <p className="text-gray-400">
            Explore and test your type-safe RPC procedures
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Procedures List */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Available Procedures
            </h2>
            <div className="space-y-2">
              {Object.entries(procedures).map(([key, proc]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedProcedure(key);
                    handleExecute(key);
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedProcedure === key
                      ? "bg-cyan-500/20 border-cyan-500"
                      : "bg-slate-700/50 border-slate-600 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-mono text-cyan-400 font-semibold">
                        {key}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {proc.description}
                      </p>
                      {proc.input && (
                        <pre className="text-xs text-gray-500 mt-2 bg-slate-900/50 p-2 rounded">
                          Input: {JSON.stringify(proc.input, null, 2)}
                        </pre>
                      )}
                    </div>
                    {selectedProcedure === key && loading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Response
            </h2>

            {!selectedProcedure && (
              <div className="text-center text-gray-400 py-12">
                Select a procedure to see the response
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <h3 className="text-red-400 font-semibold mb-2">Error</h3>
                <pre className="text-sm text-red-300 whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            )}

            {result && (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-2">Success</h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {loading && !result && !error && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
              </div>
            )}
          </div>
        </div>

        {/* Router Schema - Using $ symbol */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Router Schema ($ Metadata)
          </h2>
          <p className="text-gray-400 mb-4">
            oRPC provides runtime introspection via the <code className="bg-slate-900 px-2 py-1 rounded text-cyan-400">$</code> symbol.
            This gives you access to procedure metadata, input schemas, and more!
          </p>
          <pre className="text-sm text-gray-300 bg-slate-900 p-4 rounded-lg overflow-auto max-h-96">
            {routerMetadata}
          </pre>
        </div>

        {/* Usage Example */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            💡 How to Use the $ Symbol
          </h2>
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">1. Access procedure metadata:</p>
              <pre className="text-sm text-cyan-300 font-mono">
                orpcClient.projects.getAll.$
              </pre>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">2. Get input schema:</p>
              <pre className="text-sm text-cyan-300 font-mono">
                orpcClient.projects.create.$.input
              </pre>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">3. Get output schema:</p>
              <pre className="text-sm text-cyan-300 font-mono">
                orpcClient.projects.create.$.output
              </pre>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">4. Generate OpenAPI/REST docs:</p>
              <pre className="text-sm text-cyan-300 font-mono">
                {`// You can use $ to generate OpenAPI schemas\n// Perfect for auto-generating API documentation!`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
