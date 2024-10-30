class CPREventEmitter {
    private handlers: { [key: string]: Function[] } = {};

    public subscribe(event: string, handler: Function): () => void {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);

        return () => {
            this.handlers[event] = this.handlers[event].filter(h => h !== handler);
        };
    }

    public emit(event: string): void {
        if (this.handlers[event]) {
            this.handlers[event].forEach(handler => handler());
        }
    }
}

export const EVENTS = {
    RESET_CPR: 'RESET_CPR'
} as const;

export const cprEventEmitter = new CPREventEmitter();