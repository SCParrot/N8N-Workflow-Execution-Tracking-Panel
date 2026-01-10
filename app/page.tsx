'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChartData, TimeRangeStats, Workflow, generateTestWorkflows } from './data/testData';

// Dynamically import ECharts component to ensure client-side only rendering
const ExecutionChart = dynamic(() => import('./components/ExecutionChart'), {
  ssr: false,
  loading: () => <div className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-center h-full">
    <div className="text-gray-500">Chart loading...</div>
  </div>,
});

// Dynamically import PieChart component to ensure client-side only rendering
const PieChart = dynamic(() => import('./components/PieChart'), {
  ssr: false,
  loading: () => <div className="bg-white rounded-lg shadow-lg p-4 h-full flex items-center justify-center">
    <div className="text-gray-500">Pie chart loading...</div>
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
    <div className="min-h-svh bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">N8N Workflow Execution Tracking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-xs px-2 py-0.5 rounded-full ${mode === 'mock' ? 'bg-yellow-100 text-yellow-800' : mode === 'test' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {mode === 'mock' ? 'Mock Data Mode' : mode === 'test' ? 'Test Mode' : 'Production Mode'}
              </span>
              <span className="text-xs text-gray-500">
                Last updated: <LastUpdateTime />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Workflow Selection Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 mr-2 whitespace-nowrap">Select workflow: </span>
            {workflowsLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : workflows.length === 0 ? (
              <div className="text-sm text-gray-500">No workflows available</div>
            ) : (
              workflows.map((workflow) => (
                <button
                  key={workflow.id}
                  onClick={() => handleWorkflowChange(workflow.id)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${selectedWorkflowId === workflow.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {workflow.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto px-2 sm:px-4 lg:px-6 py-2 flex-grow w-full max-w-7xl">
        <div className="flex flex-col gap-4 min-h-[calc(50vh)]">
          {/* Top: Pie Chart Statistics */}
          <div className="w-full flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800 mb-2 px-4">Execution Result Distribution</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-lg p-4 h-48 flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(executionStats).map((stats, index) => (
                  <PieChart key={index} data={stats} />
                ))}
              </div>
            )}
          </div>
          
          {/* Bottom: Line Chart */}
          <div className="w-full flex-grow min-h-[200px]">
            {loading ? (
              <div className="bg-white rounded-lg shadow-lg p-4 h-full flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : (
              <ExecutionChart data={chartData} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            N8N Workflow Tracker © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}