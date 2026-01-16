'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChartData, TimeRangeStats, Workflow, generateTestWorkflows } from './data/testData';

// Dynamically import ECharts component to ensure client-side only rendering
const ExecutionChart = dynamic(() => import('./components/ExecutionChart'), {
  ssr: false,
  loading: () => <div className="glass-card flex items-center justify-center h-full min-h-[300px]">
    <div className="text-primary-600 animate-pulse">Chart loading...</div>
  </div>,
});

// Dynamically import PieChart component to ensure client-side only rendering
const PieChart = dynamic(() => import('./components/PieChart'), {
  ssr: false,
  loading: () => <div className="glass-card h-full flex items-center justify-center min-h-[200px]">
    <div className="text-primary-600 animate-pulse">Pie chart loading...</div>
  </div>,
});

// Last update time component, client-side only rendering
const LastUpdateTime = () => {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    setLastUpdate(new Date().toLocaleString());
  }, []);

  return <>{lastUpdate}</>;
};

// Function to fetch workflow list from API
const fetchWorkflows = async () => {
  try {
    const response = await fetch('/api/workflow/list');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.workflows;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return [];
  }
};

// Function to fetch workflow data from API
const fetchWorkflowData = async (workflowId?: string) => {
  try {
    const url = workflowId ? `/api/workflow/executions?workflowId=${workflowId}` : '/api/workflow/executions';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching workflow data:', error);
    return null;
  }
};

export default function Home() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [executionStats, setExecutionStats] = useState<Record<string, TimeRangeStats>>({});
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<string>('mock');
  const [workflowsLoading, setWorkflowsLoading] = useState(true);

  // Fetch workflow list from API
  useEffect(() => {
    const getWorkflows = async () => {
      setWorkflowsLoading(true);
      const workflowsData = await fetchWorkflows();
      setWorkflows(workflowsData);
      if (workflowsData.length > 0) {
        setSelectedWorkflowId(workflowsData[0].id);
      }
      setWorkflowsLoading(false);
    };

    getWorkflows();

    // Refresh workflow list every 5 minutes
    const interval = setInterval(getWorkflows, 300000);

    return () => clearInterval(interval);
  }, []);

  // Fetch execution data from API
  useEffect(() => {
    const getData = async () => {
      if (!selectedWorkflowId) return;

      setLoading(true);
      const data = await fetchWorkflowData(selectedWorkflowId);
      if (data) {
        setExecutionStats(data.stats);
        setChartData(data.chartData);
        setMode(data.mode);
      }
      setLoading(false);
    };

    getData();

    // Refresh execution data every 30 seconds
    const interval = setInterval(getData, 30000);

    return () => clearInterval(interval);
  }, [selectedWorkflowId]);

  // Handle workflow selection
  const handleWorkflowChange = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-indigo-600 shadow-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                N8N Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm transition-colors duration-300 ${mode === 'mock'
                ? 'bg-yellow-100/80 text-yellow-700 border border-yellow-200'
                : mode === 'test'
                  ? 'bg-blue-100/80 text-blue-700 border border-blue-200'
                  : 'bg-green-100/80 text-green-700 border border-green-200'
                }`}>
                {mode === 'mock' ? 'Mock Data' : mode === 'test' ? 'Test Env' : 'Production'}
              </span>
              <span className="text-xs text-slate-500 font-medium bg-white/50 px-3 py-1 rounded-full border border-white/20">
                Updated: <LastUpdateTime />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Active Workflow Indicator */}
      {selectedWorkflowId && (
        <div className="pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in">
          <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm border border-white/40 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${workflows.find(w => w.id === selectedWorkflowId)?.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'
                }`} />
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {workflows.find(w => w.id === selectedWorkflowId)?.name || 'Loading...'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  ID: {selectedWorkflowId}
                </p>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="px-3 py-1 bg-white/60 rounded-lg text-xs font-semibold text-slate-600 border border-white/40">
                {workflows.find(w => w.id === selectedWorkflowId)?.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Selection Area */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-4 my-8 h-12">
        {/* The expanding box */}
        <div className="absolute top-0 left-4 right-4 md:left-8 md:right-8 transition-all duration-300 ease-in-out
                        bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl
                        overflow-hidden max-h-12 hover:max-h-[80vh] hover:bg-white/95 hover:shadow-2xl hover:border-white/60 group">

          <div className="p-2 w-full">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 px-2 py-1 text-slate-500 font-semibold uppercase tracking-wider text-xs whitespace-nowrap min-w-[100px]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Workflows</span>
              </div>

              <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

              {workflowsLoading ? (
                <div className="h-8 w-24 bg-gray-200/50 rounded-full animate-pulse" />
              ) : workflows.length === 0 ? (
                <div className="text-sm text-gray-500 italic px-2">No workflows found</div>
              ) : (
                workflows.map((workflow) => (
                  <button
                    key={workflow.id}
                    onClick={() => handleWorkflowChange(workflow.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border ${selectedWorkflowId === workflow.id
                      ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-200'
                      }`}
                  >
                    {workflow.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Subtle indicator to show it can expand */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-0 transition-opacity duration-300 text-slate-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex-grow w-full max-w-7xl animate-fade-in">
        <div className="flex flex-col gap-6">


          {/* Top: Pie Chart Statistics */}
          <section>
            <div className="flex items-center mb-4 ml-1">
              <h2 className="text-lg font-bold text-slate-800">Distribution Analysis</h2>
              <div className="h-px bg-slate-200 flex-grow ml-4"></div>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass-card h-48 flex items-center justify-center">
                    <div className="text-primary-400 animate-pulse">Loading stats...</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(executionStats).map((stats, index) => (
                  <div key={index} className="transition-transform hover:-translate-y-1 duration-300">
                    <PieChart data={stats} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bottom: Line Chart */}
          <section className="flex-grow">
            <div className="flex items-center mb-4 ml-1">
              <h2 className="text-lg font-bold text-slate-800">Execution Timeline (24h)</h2>
              <div className="h-px bg-slate-200 flex-grow ml-4"></div>
            </div>
            <div className="w-full min-h-[400px]">
              {loading ? (
                <div className="glass-card h-[400px] flex items-center justify-center">
                  <div className="text-primary-400 animate-pulse">Loading charts...</div>
                </div>
              ) : (
                <ExecutionChart data={chartData} />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-slate-500">
            N8N Workflow Tracker &copy; {new Date().getFullYear()} &middot; Built with Next.js & Tailwind
          </p>
        </div>
      </footer>
    </div>
  );
}