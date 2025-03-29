import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';

// 游戏难度设置
const DIFFICULTY = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 20 },
  hard: { rows: 16, cols: 16, mines: 40 }
};

// 单元格状态
interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const MinesweeperGame: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [flagsCount, setFlagsCount] = useState(0);

  // 创建游戏网格
  const createGrid = useCallback((diff: Difficulty) => {
    const { rows, cols, mines } = DIFFICULTY[diff];

    // 初始化空网格
    const newGrid: Cell[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // 随机放置地雷
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // 计算每个单元格周围的地雷数
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (newGrid[row][col].isMine) continue;

        let count = 0;
        // 检查周围8个方向
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
            if (r === row && c === col) continue;
            if (newGrid[r][c].isMine) count++;
          }
        }

        newGrid[row][col].neighborMines = count;
      }
    }

    return newGrid;
  }, []);

  // 初始化游戏
  const initGame = useCallback((diff: Difficulty) => {
    const newGrid = createGrid(diff);
    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    setFlagsCount(0);
  }, [createGrid]);

  // 组件挂载时初始化游戏
  useEffect(() => {
    initGame(difficulty);
  }, [difficulty, initGame]);

  // 揭示单元格
  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || grid[row][col].isRevealed || grid[row][col].isFlagged) {
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newGrid = [...grid];

    // 如果点击到地雷，游戏结束
    if (newGrid[row][col].isMine) {
      // 揭示所有地雷
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[0].length; c++) {
          if (newGrid[r][c].isMine) {
            newGrid[r][c].isRevealed = true;
          }
        }
      }
      setGameOver(true);
      setGrid(newGrid);
      return;
    }

    // 递归揭示空白区域
    const revealEmpty = (r: number, c: number) => {
      // 边界检查
      if (r < 0 || r >= newGrid.length || c < 0 || c >= newGrid[0].length) {
        return;
      }

      // 已揭示或标记的不处理
      if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged) {
        return;
      }

      // 揭示当前单元格
      newGrid[r][c].isRevealed = true;

      // 如果是空白单元格，递归揭示周围的单元格
      if (newGrid[r][c].neighborMines === 0) {
        for (let nr = Math.max(0, r - 1); nr <= Math.min(newGrid.length - 1, r + 1); nr++) {
          for (let nc = Math.max(0, c - 1); nc <= Math.min(newGrid[0].length - 1, c + 1); nc++) {
            if (nr === r && nc === c) continue;
            revealEmpty(nr, nc);
          }
        }
      }
    };

    revealEmpty(row, col);
    setGrid(newGrid);

    // 检查是否胜利
    checkWin(newGrid);
  };

  // 标记单元格
  const flagCell = (row: number, col: number) => {
    if (gameOver || gameWon || grid[row][col].isRevealed) {
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newGrid = [...grid];
    const cell = newGrid[row][col];

    // 切换标记状态
    cell.isFlagged = !cell.isFlagged;

    // 更新标记计数
    setFlagsCount(prev => cell.isFlagged ? prev + 1 : prev - 1);

    setGrid(newGrid);
  };

  // 检查是否胜利
  const checkWin = (currentGrid: Cell[][]) => {
    const { rows, cols, mines } = DIFFICULTY[difficulty];
    let revealedCount = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (currentGrid[r][c].isRevealed && !currentGrid[r][c].isMine) {
          revealedCount++;
        }
      }
    }

    // 如果揭示的非地雷单元格数量 = 总单元格数 - 地雷数，则获胜
    if (revealedCount === (rows * cols) - mines) {
      setGameWon(true);

      // 自动标记所有地雷
      const finalGrid = [...currentGrid];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (finalGrid[r][c].isMine) {
            finalGrid[r][c].isFlagged = true;
          }
        }
      }
      setGrid(finalGrid);
      setFlagsCount(mines);
    }
  };

  // 单元格渲染
  const renderCell = (cell: Cell, row: number, col: number) => {
    const getCellContent = () => {
      if (cell.isFlagged) {
        return '🚩';
      }

      if (!cell.isRevealed) {
        return '';
      }

      if (cell.isMine) {
        return '💣';
      }

      return cell.neighborMines === 0 ? '' : cell.neighborMines;
    };

    const getCellStyle = () => {
      let backgroundColor = '#e0e0e0';
      let color = 'inherit';

      if (cell.isRevealed) {
        backgroundColor = cell.isMine ? '#ff8a80' : '#ffffff';

        if (!cell.isMine && cell.neighborMines > 0) {
          // 数字颜色对应不同数量
          const colors = ['', '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#ff8f00', '#0097a7', '#000000', '#607d8b'];
          color = colors[cell.neighborMines];
        }
      }

      return {
        width: 35,
        height: 35,
        backgroundColor,
        color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        border: '1px solid #bdbdbd',
        transition: 'background-color 0.2s'
      };
    };

    return (
      <Box
        sx={getCellStyle()}
        onClick={() => revealCell(row, col)}
        onContextMenu={(e) => {
          e.preventDefault();
          flagCell(row, col);
        }}
      >
        {getCellContent()}
      </Box>
    );
  };

  const { rows, cols, mines } = DIFFICULTY[difficulty];

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        扫雷
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Button
            variant={difficulty === 'easy' ? 'contained' : 'outlined'}
            onClick={() => initGame('easy')}
            sx={{ mr: 1 }}
          >
            简单
          </Button>
          <Button
            variant={difficulty === 'medium' ? 'contained' : 'outlined'}
            onClick={() => initGame('medium')}
            sx={{ mr: 1 }}
          >
            中等
          </Button>
          <Button
            variant={difficulty === 'hard' ? 'contained' : 'outlined'}
            onClick={() => initGame('hard')}
          >
            困难
          </Button>
        </Box>

        <Typography>
          旗帜: {flagsCount} / {mines}
        </Typography>
      </Box>

      {(gameOver || gameWon) && (
        <Typography variant="h6" color={gameWon ? 'success.main' : 'error.main'} gutterBottom>
          {gameWon ? '恭喜，你赢了！' : '游戏结束'}
        </Typography>
      )}

      <Paper
        elevation={3}
        sx={{
          display: 'inline-block',
          p: 2,
          mb: 2,
        }}
      >
        <Grid container spacing={0}>
          {grid.map((row, rowIndex) => (
            <Grid item xs={12} key={rowIndex} sx={{ display: 'flex' }}>
              {row.map((cell, colIndex) => (
                <React.Fragment key={`${rowIndex}-${colIndex}`}>
                  {renderCell(cell, rowIndex, colIndex)}
                </React.Fragment>
              ))}
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box>
        <Button variant="contained" onClick={() => initGame(difficulty)}>
          新游戏
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          左键点击揭示单元格，右键点击标记地雷
        </Typography>
      </Box>
    </Box>
  );
};

export default MinesweeperGame; 