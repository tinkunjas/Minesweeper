const GameState = { 
    PLAYING: 1, 
    WIN: 2, 
    LOST: 3, 
    STOPPED: 4 
};

window.GameState = GameState;

const GameLevels = {
    BEGINNER: {
        name: 'beginner',
        size: 8,
        mines: 10
    },
    INTERMEDIATE: {
        name: 'intermediate', 
        size: 16,
        mines: 40
    },
    EXPERT: {
        name: 'expert',
        size: 25,
        mines: 99
    }
};

class Game {
    constructor() {
        this.board = null;
        this.view = null;
        this.state = GameState.STOPPED;
        this.mines = 0;
        this.startTime = null;
        this.timer = null;
    }

    start() {
        if (this.state !== GameState.STOPPED) {
            return;
        }

        try {
            this.prepareBoard();
            this.state = GameState.PLAYING;
            this.startTime = Date.now();
            this.startTimer();
        } catch (error) {
            console.error('Failed to start game:', error);
            this.state = GameState.STOPPED;
        }
    }

    restart() {
        try {
            this.state = GameState.PLAYING;
            this.board.refresh(this.mines);
            this.startTime = Date.now();
            this.startTimer();
        } catch (error) {
            console.error('Failed to restart game:', error);
        }
    }

    prepareBoard() {
        const levelElement = document.getElementById("level");
        
        if (!levelElement) {
            throw new Error('Required DOM elements not found');
        }

        const level = levelElement.value;
        
        let levelConfig = null;
        
        for (const key in GameLevels) {
            if (GameLevels[key].name === level) {
                levelConfig = GameLevels[key];
                break;
            }
        }

        if (!levelConfig) {
            throw new Error(`Invalid level: ${level}`);
        }

        this.mines = levelConfig.mines;
        const size = levelConfig.size;

        const model = new BoardModel(size, size);
        const view = new BoardView(model, "board");

        this.board = new Board(model, view);
        this.board.refresh(this.mines);
        this.updateStats();
    }

    changeState(state) {
        if (this.state === state) return;
        
        this.state = state;
        this.stopTimer();
        
        switch (state) {
            case GameState.WIN:
                this.showWinMessage();
                break;
            case GameState.LOST:
                this.board.openAllMines();
                this.showLoseMessage();
                break;
        }
    }

    showWinMessage() {
        const timeElapsed = this.getElapsedTime();
        const message = `🎉 POBIJEDILI STE!!! Vrijeme: ${timeElapsed}s`;
        this.showMessage(message, 'success');
    }

    showLoseMessage() {
        const message = "💥 IZGUBILI STE!!!";
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimer() {
        const timeElement = document.getElementById('timer');
        if (timeElement) {
            timeElement.textContent = this.getElapsedTime();
        }
    }

    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    updateStats() {
        const minesElement = document.getElementById('mines-count');
        const openedElement = document.getElementById('opened-count');
        
        if (minesElement) {
            minesElement.textContent = this.mines;
        }
        
        if (openedElement && this.board && this.board.getModel) {
            const model = this.board.getModel();
            openedElement.textContent = model.openedCount || 0;
        }
    }

    getState() {
        return this.state;
    }

    getMines() {
        return this.mines;
    }

    getBoard() {
        return this.board;
    }

    destroy() {
        this.stopTimer();
        if (this.board) {
            this.board.getView().destroy();
        }
        this.state = GameState.STOPPED;
        
        const boardElement = document.getElementById('board');
        if (boardElement) {
            boardElement.innerHTML = '';
        }
        
        const timerElement = document.getElementById('timer');
        const openedElement = document.getElementById('opened-count');
        if (timerElement) timerElement.textContent = '0';
        if (openedElement) openedElement.textContent = '0';
    }
}
window.Game = new Game();
