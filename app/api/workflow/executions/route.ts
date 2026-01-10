import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';
import { generateTestData, calculateStats, generateChartData } from '../../../data/testData';

// Get configuration
const getCurrentConfig = () => {
  try {
    // Build absolute path to config file
    const configPath = join(process.cwd(), 'config', 'config.yaml');
    // Read config file content
    const configContent = readFileSync(configPath, 'utf8');
    // Parse YAML content
    const config = parse(configContent);
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    // Return default config if YAML loading fails
    return {
      mode: 'mock',
      mock: { enabled: true },
      test: { 
        baseURL: 'http://localhost:5678',
        token: 'test-n8n-token',
        workflow: { id: 'test-workflow-id' }
      },
      production: { 
        baseURL: 'https://your-n8n-instance.com',
        token: 'your-n8n-token',
        workflow: { id: 'your-workflow-id' }
      }
    };
  }
};

// Function to fetch n8n execution data (with pagination support)
const fetchN8nExecutions = async (baseURL: string, token: string, workflowId: string) => {
  try {
    let allExecutions: any[] = [];
    let nextCursor: string | undefined;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Loop to fetch all data until no nextCursor or data exceeds 24 hours
    do {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (workflowId) {
        queryParams.append('workflowId', workflowId);
      }
      
      // Set maximum limit value to 250
      queryParams.append('limit', '250');
      
      // Add cursor parameter if available
      if (nextCursor) {
        queryParams.append('cursor', nextCursor);
      }
      
      const response = await fetch(`${baseURL}/api/v1/executions?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': token,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const executions = responseData.data || [];
      
      // Add fetched data to all executions
      allExecutions = [...allExecutions, ...executions];
      
      // Get nextCursor for next page request
      nextCursor = responseData.nextCursor;
      
      // Check if any data exceeds 24 hours, if yes, stop requesting
      if (executions.length > 0) {
        const oldestExecution = new Date(executions[executions.length - 1].startedAt);
        if (oldestExecution < twentyFourHoursAgo) {
          break;
        }
      }
      
    } while (nextCursor);
    
    // Filter out data within 24 hours
    const filteredExecutions = allExecutions.filter(execution => {
      const executionTime = new Date(execution.startedAt);
      return executionTime >= twentyFourHoursAgo && executionTime <= now;
    });
    
    return filteredExecutions;
  } catch (error) {
    console.error('Error fetching n8n executions:', error);
    return [];
  }
};

// Transform n8n execution data to our format
const transformN8nData = (n8nData: any[]) => {
  return n8nData.map(execution => ({
    id: execution.id,
    workflowId: execution.workflowId,
    status: (execution.status === 'success' ? 'success' : 'error') as 'success' | 'error',
    startedAt: execution.startedAt,
    finishedAt: execution.finishedAt,
  }));
};

export async function GET(request: NextRequest) {
  // Get workflowId query parameter
  const searchParams = request.nextUrl.searchParams;
  const workflowId = searchParams.get('workflowId');
  
  const currentConfig = getCurrentConfig();
  let executions = [];
  
  if (currentConfig.mode === 'mock' || !currentConfig[currentConfig.mode].enabled) {
    // Mock data mode
    executions = generateTestData(workflowId || undefined);
  } else {
    // Test or production mode
    const envConfig = currentConfig[currentConfig.mode];
    const targetWorkflowId = workflowId || envConfig.workflow.id;
    const n8nData = await fetchN8nExecutions(envConfig.baseURL, envConfig.token, targetWorkflowId);
    executions = transformN8nData(n8nData);
  }
  
  const stats = calculateStats(executions, workflowId || undefined);
  const chartData = generateChartData(executions, workflowId || undefined);
  
  return NextResponse.json({
    mode: currentConfig.mode,
    stats,
    chartData,
    executions: executions.slice(0, 20), // Return most recent 20 execution records
  });
}
