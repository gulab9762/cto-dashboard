import './style.css'

interface MetricsResponse {
    prsMerged: number;
    averageCycleTime: number;
}

async function getOrganizationMetrics(orgId: string): Promise<any> {
    const query = `
      query GetMetrics($orgId: ID!) {
        organization(id: $orgId) {
          metrics(days: 30) {
            prsMerged
            averageCycleTime
          }
        }
      }
    `;
    
    const response = await fetch('https://qd3w2jjv-4000.inc1.devtunnels.ms/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { orgId }
      })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    const fetchBtn = document.getElementById('fetchBtn') as HTMLButtonElement | null;
    const orgIdInput = document.getElementById('orgIdInput') as HTMLInputElement | null;
    const loader = document.getElementById('loader') as HTMLDivElement | null;
    const errorMsg = document.getElementById('errorMsg') as HTMLDivElement | null;
    const metricsGrid = document.getElementById('metricsGrid') as HTMLDivElement | null;
    
    const prsMergedValue = document.getElementById('prsMergedValue') as HTMLDivElement | null;
    const cycleTimeValue = document.getElementById('cycleTimeValue') as HTMLSpanElement | null;

    if (!fetchBtn || !orgIdInput || !loader || !errorMsg || !metricsGrid || !prsMergedValue || !cycleTimeValue) {
        return;
    }

    const handleFetch = async () => {
        const orgId = orgIdInput.value.trim();
        if (!orgId) return;

        // Reset UI
        errorMsg.style.display = 'none';
        metricsGrid.style.display = 'none';
        loader.style.display = 'flex';
        fetchBtn.disabled = true;
        fetchBtn.textContent = 'Analyzing...';

        try {
            const result = await getOrganizationMetrics(orgId);
            
            if (result.errors && result.errors.length > 0) {
                throw new Error(result.errors[0].message);
            }

            const data: MetricsResponse = result.data?.organization?.metrics;
            if (data) {
                // Update specific DOM elements
                prsMergedValue.textContent = data.prsMerged.toString();
                cycleTimeValue.textContent = data.averageCycleTime ? data.averageCycleTime.toFixed(1) : '0.0';
                
                // Show grid
                metricsGrid.style.display = 'grid';
            } else {
                throw new Error('Organization not found or metrics unavailable.');
            }

        } catch (error: any) {
            console.error('Fetch error:', error);
            errorMsg.textContent = `Error: ${error.message}`;
            errorMsg.style.display = 'block';
        } finally {
            loader.style.display = 'none';
            fetchBtn.disabled = false;
            fetchBtn.textContent = 'Fetch Metrics';
        }
    };

    fetchBtn.addEventListener('click', handleFetch);

    // Handle enter key
    orgIdInput.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFetch();
        }
    });
});
