class Cell {
    constructor() {
        this.hasMine = false;
        this.isOpen = false;
        this.hasFlag = false;
        this.neighbors = 0;
    }
}

class Event {
    constructor(sender) {
        this._sender = sender;
        this._listeners = [];
    }

    attach(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }
        this._listeners.push(listener);
    }

    detach(listener) {
        const index = this._listeners.indexOf(listener);
        if (index > -1) {
            this._listeners.splice(index, 1);
        }
    }

    notify(args) {
        this._listeners.forEach(listener => {
            try {
                listener(this._sender, args);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    }

    clear() {
        this._listeners = [];
    }

    get listenerCount() {
        return this._listeners.length;
    }
}
