class BoardView {
    constructor(model, elementId) {
        if (!model || !elementId) {
            throw new Error('Model and elementId are required');
        }

        this.model = model;
        this.element = document.getElementById(elementId);
        
        if (!this.element) {
            throw new Error(`Element with id '${elementId}' not found`);
        }

        this.element.innerHTML = "";
        this.table = document.createElement("table");
        this.element.appendChild(this.table);

        this.clicked = new Event(this);
        this.rightClicked = new Event(this);

        this.model.cellOpened.attach(this.updateCell.bind(this));
        this.model.flagSwitched.attach(this.flagHandler.bind(this));
    }

    flagHandler(sender, args) {
        const { column, row, hasFlag } = args;
        const cell = this.table.rows[row]?.cells[column];
        
        if (!cell) {
            return;
        }

        if (hasFlag) { 
            cell.innerHTML = "<span class='flag'>&#x2691;</span>";
        } else {
            cell.innerHTML = "";
        } 
    }

    updateCell(sender, args) {
        const { column, row, cell } = args;
        const tableCell = this.table.rows[row]?.cells[column];
        
        if (!tableCell) {
            return;
        }

        tableCell.className = "";

        if (cell.hasMine) { 
            tableCell.innerHTML = "<span class='bomb'>&#x1f4a3;</span>";
        } else {
            if (cell.neighbors === 0) {
                tableCell.innerHTML = "<span class='number0'></span>";
            } else {
                tableCell.innerHTML = `<span class='number${cell.neighbors}'>${cell.neighbors}</span>`;
            }
        }
    }

    render() {
        this.table.innerHTML = "";
        
        const rows = this.model.getRows();
        const cols = this.model.getColumns();
        
        for (let i = 0; i < rows; i++) {
            const row = this.table.insertRow();
            
            for (let j = 0; j < cols; j++) {
                const cell = row.insertCell();
                cell.className = 'closed';

                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.clicked.notify({ column: j, row: i });
                });

                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.rightClicked.notify({ column: j, row: i });
                    return false;
                });

                cell.addEventListener('selectstart', (e) => e.preventDefault());
            }
        }
    }

    getElement() {
        return this.element;
    }

    getTable() {
        return this.table;
    }

    destroy() {
        this.model.cellOpened.detach(this.updateCell.bind(this));
        this.model.flagSwitched.detach(this.flagHandler.bind(this));
        
        if (this.element && this.table) {
            this.element.removeChild(this.table);
        }
    }
}
