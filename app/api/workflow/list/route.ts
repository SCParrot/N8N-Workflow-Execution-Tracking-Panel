import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';
import { generateTestWorkflows } from '../../../data/testData';

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

// Function to fetch workflow list from n8n API
const fetchN8nWorkflows = async (baseURL: string, token: string) => {
  try {
    const response = await fetch(`${baseURL}/api/v1/workflows?active=true&limit=100`, {
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

    const data = await response.json();
    // Filter out published workflows
    return data.data.filter((workflow: any) => workflow.active === true);
  } catch (error) {
    console.error('Error fetching n8n workflows:', error);
    return [];
  }
};

// Transform n8n workflow data to our format
const transformN8nWorkflows = (n8nData: any[]) => {
  return n8nData.map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    active: workflow.active,
    createdAt: workflow.createdAt,
  }));
};

export async function GET(request: NextRequest) {
  const currentConfig = getCurrentConfig();
  let workflows = [];
  
  if (currentConfig.mode === 'mock' || !currentConfig[currentConfig.mode].enabled) {
    // Mock data mode
    workflows = generateTestWorkflows();
  } else {
    // Test or production mode
    const envConfig = currentConfig[currentConfig.mode];
    const n8nData = await fetchN8nWorkflows(envConfig.baseURL, envConfig.token);
    workflows = transformN8nWorkflows(n8nData);
  }
  
  return NextResponse.json({
    mode: currentConfig.mode,
    workflows,
  });
}