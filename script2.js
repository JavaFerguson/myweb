document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.querySelector('.status');
    const resetButton = document.querySelector('.reset-btn');

    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];

    const winningConditions = [
        [0, 1, 2], // 第一行
        [3, 4, 5], // 第二行
        [6, 7, 8], // 第三行
        [0, 3, 6], // 第一列
        [1, 4, 7], // 第二列
        [2, 5, 8], // 第三列
        [0, 4, 8], // 主对角线
        [2, 4, 6]  // 副对角线
    ];

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // 如果单元格已有内容或游戏未激活，则不做任何操作
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        // 更新游戏状态和UI
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;

        // 检查是否获胜
        checkWinner();
    }

    function checkWinner() {
        let roundWon = false;

        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];

            // 检查是否有空单元格
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
                continue;
            }

            // 检查三个单元格是否相同
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                // 高亮显示获胜的单元格
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                break;
            }
        }

        if (roundWon) {
            statusDisplay.textContent = `玩家 ${currentPlayer} 获胜!`;
            gameActive = false;
            return;
        }

        // 检查是否平局
        let roundDraw = !gameState.includes('');
        if (roundDraw) {
            statusDisplay.textContent = '游戏平局!';
            gameActive = false;
            return;
        }

        // 切换玩家
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `轮到: ${currentPlayer}`;
    }

    function resetGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.textContent = `轮到: ${currentPlayer}`;

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('winner');
        });
    }

    // 添加事件监听器
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', resetGame);
});