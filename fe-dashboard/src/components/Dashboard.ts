import { MetricsService } from '../services/metrics.service';
import type { MetricsData } from '../types/metrics';

export class Dashboard {
    private fetchBtn: HTMLButtonElement;
    private orgIdInput: HTMLInputElement;
    private loader: HTMLDivElement;
    private errorMsg: HTMLDivElement;
    private metricsGrid: HTMLDivElement;
    private prsMergedValue: HTMLDivElement;
    private cycleTimeValue: HTMLSpanElement;

    constructor() {
        this.fetchBtn = document.getElementById('fetchBtn') as HTMLButtonElement;
        this.orgIdInput = document.getElementById('orgIdInput') as HTMLInputElement;
        this.loader = document.getElementById('loader') as HTMLDivElement;
        this.errorMsg = document.getElementById('errorMsg') as HTMLDivElement;
        this.metricsGrid = document.getElementById('metricsGrid') as HTMLDivElement;
        this.prsMergedValue = document.getElementById('prsMergedValue') as HTMLDivElement;
        this.cycleTimeValue = document.getElementById('cycleTimeValue') as HTMLSpanElement;

        this.init();
    }

    private init() {
        if (!this.fetchBtn || !this.orgIdInput) return;

        this.fetchBtn.addEventListener('click', () => this.handleFetch());
        this.orgIdInput.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') this.handleFetch();
        });
    }

    private async handleFetch() {
        const orgId = this.orgIdInput.value.trim();
        if (!orgId) return;

        this.setLoading(true);

        try {
            const data: MetricsData = await MetricsService.getOrganizationMetrics(orgId);
            this.updateUI(data);
        } catch (error: any) {
            console.error('Fetch error:', error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    private setLoading(isLoading: boolean) {
        if (this.errorMsg) this.errorMsg.style.display = 'none';
        
        if (isLoading) {
            if (this.metricsGrid) this.metricsGrid.style.display = 'none';
            if (this.loader) this.loader.style.display = 'flex';
            this.fetchBtn.disabled = true;
            this.fetchBtn.textContent = 'Analyzing...';
        } else {
            if (this.loader) this.loader.style.display = 'none';
            this.fetchBtn.disabled = false;
            this.fetchBtn.textContent = 'Fetch Metrics';
        }
    }

    private updateUI(data: MetricsData) {
        if (this.prsMergedValue) this.prsMergedValue.textContent = data.prsMerged.toString();
        if (this.cycleTimeValue) this.cycleTimeValue.textContent = data.averageCycleTime ? data.averageCycleTime.toFixed(1) : '0.0';
        
        if (this.metricsGrid) this.metricsGrid.style.display = 'grid';
    }

    private showError(message: string) {
        if (this.errorMsg) {
            this.errorMsg.textContent = `Error: ${message}`;
            this.errorMsg.style.display = 'block';
        }
    }
}
