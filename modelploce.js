class BoardModel {
    constructor(width, height) {
        if (width <= 0 || height <= 0) {
            throw new Error('Board dimensions must be positive');
        }
        
        this._width = width;
        this._height = height;
        this.openedCount = 0;
        this.cellOpened = new Event(this);
        this.flagSwitched = new Event(this);

        this._cells = Array.from({ length: width }, () => 
            Array.from({ length: height }, () => new Cell())
        );
    }

    getRows() {
        return this._height;
    }

    getColumns() {
        return this._width;
    }

    clear() {
        for (let i = 0; i < this._width; i++) {
            for (let j = 0; j < this._height; j++) {
                const cell = this._cells[i][j];
                cell.isOpen = false;
                cell.hasMine = false;
                cell.hasFlag = false;
                cell.neighbors = 0;
            }
        }
        this.openedCount = 0;
    }
    
    setMines(bombs) {
        if (bombs < 0 || bombs > this._width * this._height) {
            throw new Error('Invalid number of bombs');
        }

        let bombsPlaced = 0;
        const maxAttempts = bombs * 10;
        let attempts = 0;

        while (bombsPlaced < bombs && attempts < maxAttempts) {
            const i = Math.floor(Math.random() * this._width);
            const j = Math.floor(Math.random() * this._height);
            
            if (!this._cells[i][j].hasMine) {
                this._cells[i][j].hasMine = true;
                bombsPlaced++;
            }
            attempts++;
        }

        if (bombsPlaced < bombs) {
            console.warn(`Could only place ${bombsPlaced} out of ${bombs} bombs`);
        }
    }

    findNeighbors() {
        for (let i = 0; i < this._width; i++) {
            for (let j = 0; j < this._height; j++) {
                this._cells[i][j].neighbors = this.getBombsAround(i, j);
            }
        }
    }

    getBombsAround(column, row) {
        if (!this.isValidPosition(column, row)) {
            return 0;
        }

        let bombs = 0;
        for (let i = Math.max(0, column - 1); i <= Math.min(this._width - 1, column + 1); i++) {
            for (let j = Math.max(0, row - 1); j <= Math.min(this._height - 1, row + 1); j++) {
                if (i === column && j === row) continue;
                if (this._cells[i][j].hasMine) bombs++;
            }
        }
        return bombs;
    }

    isValidPosition(column, row) {
        return column >= 0 && column < this._width && row >= 0 && row < this._height;
    }

    open(column, row) {
        if (!this.isValidPosition(column, row)) {
            return;
        }

        const cell = this._cells[column][row];
        if (cell.isOpen || cell.hasFlag) {
            return;
        }

        cell.isOpen = true;
        this.openedCount++;

        if (cell.hasMine) {
            this.cellOpened.notify({ column, row, cell });
            return;
        }

        if (cell.neighbors === 0) {
            this.openNeighbors(column, row);
        }

        this.cellOpened.notify({ column, row, cell });
    }

    openNeighbors(column, row) {
        for (let i = Math.max(0, column - 1); i <= Math.min(this._width - 1, column + 1); i++) {
            for (let j = Math.max(0, row - 1); j <= Math.min(this._height - 1, row + 1); j++) {
                if (i === column && j === row) continue;
                this.open(i, j);
            }
        }
    }

    switchFlag(column, row) {
        if (!this.isValidPosition(column, row)) {
            return;
        }

        const cell = this._cells[column][row];
        if (cell.isOpen) return;

        cell.hasFlag = !cell.hasFlag;
        this.flagSwitched.notify({ column, row, hasFlag: cell.hasFlag });
    }

    openAllMines() {
        for (let i = 0; i < this._width; i++) {
            for (let j = 0; j < this._height; j++) {
                const cell = this._cells[i][j];
                if (cell.hasMine && !cell.isOpen) {
                    cell.hasFlag = false;
                    cell.isOpen = true;
                    this.cellOpened.notify({ column: i, row: j, cell });
                }
            }
        }
    }

    getCell(column, row) {
        if (!this.isValidPosition(column, row)) {
            return null;
        }
        return this._cells[column][row];
    }
}
