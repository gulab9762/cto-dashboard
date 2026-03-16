export class MetricCard {
    private element: HTMLElement;
    private valueElement: HTMLElement;

    constructor(containerId: string, valueId: string) {
        this.element = document.getElementById(containerId) as HTMLElement;
        this.valueElement = document.getElementById(valueId) as HTMLElement;
    }

    update(value: string | number) {
        if (this.valueElement) {
            this.valueElement.textContent = typeof value === 'number' ? value.toFixed(1) : value.toString();
        }
    }

    show() {
        if (this.element) this.element.style.display = 'block';
    }

    hide() {
        if (this.element) this.element.style.display = 'none';
    }
}
