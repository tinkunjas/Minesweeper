class Board {
    constructor(model, view) {
        if (!model || !view) {
            throw new Error('Model and view are required');
        }

        this.model = model;
        this.view = view;

        this.hasMine = new Event(this);
        this.demined = new Event(this);

        this.model.cellOpened.attach(this.checkMine.bind(this));
        this.view.clicked.attach(this.viewClickHandler.bind(this));
        this.view.rightClicked.attach(this.viewRightClickHandler.bind(this));
    }

    refresh(mines) {
        if (mines < 0) {
            throw new Error('Number of mines must be non-negative');
        }

        this.model.clear();
        this.model.setMines(mines);
        this.model.findNeighbors();
        this.view.render();
        
        this.updateStats();
    }

    viewClickHandler(sender, args) {
        const game = window.Game;
        const gameState = window.GameState;
        
        if (game && gameState && 
            (game.state === gameState.LOST || game.state === gameState.WIN)) {
            return;
        }
        this.model.open(args.column, args.row);
        
        this.updateStats();
    }

    viewRightClickHandler(sender, args) {
        const game = window.Game;
        const gameState = window.GameState;
        
        if (game && gameState && 
            (game.state === gameState.LOST || game.state === gameState.WIN)) {
            return;
        }
        this.model.switchFlag(args.column, args.row);
    }

    checkMine(sender, args) {
        const game = window.Game;
        const gameState = window.GameState;
        
        if (args.cell.hasMine) {
            if (game && gameState) {
                game.changeState(gameState.LOST);
            }
            this.hasMine.notify(args);
        } else {
            const totalCells = this.model.getColumns() * this.model.getRows();
            const safeCells = totalCells - (game ? game.mines : 0);
            
            if (this.model.openedCount === safeCells) {
                if (game && gameState) {
                    game.changeState(gameState.WIN);
                }
                this.demined.notify(args);
            }
        }
        
        this.updateStats();
    }

    updateStats() {
        const game = window.Game;
        if (game && game.updateStats) {
            game.updateStats();
        }
    }

    openAllMines() {
        this.model.openAllMines();
    }

    getModel() {
        return this.model;
    }

    getView() {
        return this.view;
    }
}

