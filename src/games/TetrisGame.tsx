import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
  '#FF0D72', // magenta
  '#0DC2FF', // cyan
  '#0DFF72', // green
  '#F538FF', // pink
  '#FF8E0D', // orange
  '#FFE138', // yellow
  '#3877FF', // blue
];

// 方块形状定义
const SHAPES = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ], // I
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ], // J
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ], // L
  [
    [4, 4],
    [4, 4],
  ], // O
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ], // S
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0],
  ], // T
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ], // Z
];

const TetrisGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  // 游戏状态
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const dropTimeRef = useRef<number>(1000);
  const dropCounterRef = useRef<number>(0);

  // 游戏数据
  const boardRef = useRef<number[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const playerRef = useRef({
    pos: { x: 0, y: 0 },
    shape: [] as number[][],
    color: 1,
  });

  // 创建新方块
  const createPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIndex];
    return {
      pos: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 },
      shape: shape,
      color: shapeIndex + 1,
    };
  }, []);

  // 检查碰撞
  const checkCollision = useCallback(
    (player: typeof playerRef.current, board: number[][]) => {
      for (let y = 0; y < player.shape.length; y++) {
        for (let x = 0; x < player.shape[y].length; x++) {
          if (player.shape[y][x] !== 0) {
            const newX = player.pos.x + x;
            const newY = player.pos.y + y;

            if (
              newX < 0 ||
              newX >= COLS ||
              newY >= ROWS ||
              (newY >= 0 && board[newY][newX] !== 0)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  // 旋转方块
  const rotate = useCallback(
    (matrix: number[][], dir: number) => {
      const rotated = matrix.map((_, i) =>
        matrix.map((col) => col[i])
      );
      if (dir > 0) return rotated.map((row) => row.reverse());
      return rotated.reverse();
    },
    []
  );

  // 合并方块到棋盘
  const merge = useCallback(() => {
    const { shape, pos, color } = playerRef.current;
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          boardRef.current[y + pos.y][x + pos.x] = color;
        }
      });
    });
  }, []);

  // 清除完整的行
  const clearLines = useCallback(() => {
    let lines = 0;
    boardRef.current.forEach((row, y) => {
      if (row.every((value) => value !== 0)) {
        lines++;
        boardRef.current.splice(y, 1);
        boardRef.current.unshift(Array(COLS).fill(0));
      }
    });
    if (lines > 0) {
      setScore((prev) => prev + lines * 100 * level);
      setLevel((prev) => (score + lines * 100 * prev >= prev * 1000 ? prev + 1 : prev));
      dropTimeRef.current = 1000 / level;
    }
  }, [level, score]);

  // 移动方块
  const movePlayer = useCallback(
    (dir: number) => {
      playerRef.current.pos.x += dir;
      if (checkCollision(playerRef.current, boardRef.current)) {
        playerRef.current.pos.x -= dir;
      }
    },
    [checkCollision]
  );

  // 往下移动方块
  const dropPlayer = useCallback(() => {
    playerRef.current.pos.y++;
    if (checkCollision(playerRef.current, boardRef.current)) {
      playerRef.current.pos.y--;
      merge();
      const newPiece = createPiece();
      playerRef.current = newPiece;
      clearLines();
      
      // 检查游戏结束
      if (checkCollision(playerRef.current, boardRef.current)) {
        setGameOver(true);
      }
    }
    dropCounterRef.current = 0;
  }, [checkCollision, merge, createPiece, clearLines]);

  // 硬降（直接降到底部）
  const hardDrop = useCallback(() => {
    while (!checkCollision({ ...playerRef.current, pos: { ...playerRef.current.pos, y: playerRef.current.pos.y + 1 } }, boardRef.current)) {
      playerRef.current.pos.y++;
    }
    dropPlayer();
  }, [checkCollision, dropPlayer]);

  // 旋转方块
  const playerRotate = useCallback(() => {
    const pos = playerRef.current.pos.x;
    let offset = 1;
    const clonedPlayer = {
      ...playerRef.current,
      shape: rotate(playerRef.current.shape, 1),
    };

    while (checkCollision(clonedPlayer, boardRef.current)) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.shape[0].length) {
        rotate(clonedPlayer.shape, -1);
        clonedPlayer.pos.x = pos;
        return;
      }
    }

    playerRef.current = clonedPlayer;
  }, [checkCollision, rotate]);

  // 绘制游戏
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景网格
    ctx.strokeStyle = '#ddd';
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * BLOCK_SIZE, 0);
      ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK_SIZE);
      ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
      ctx.stroke();
    }

    // 绘制已经落下的方块
    boardRef.current.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = COLORS[value - 1];
          ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });

    // 绘制当前方块
    playerRef.current.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = COLORS[playerRef.current.color - 1];
          ctx.fillRect(
            (x + playerRef.current.pos.x) * BLOCK_SIZE,
            (y + playerRef.current.pos.y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
          ctx.strokeStyle = '#000';
          ctx.strokeRect(
            (x + playerRef.current.pos.x) * BLOCK_SIZE,
            (y + playerRef.current.pos.y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });
  }, []);

  // 游戏循环
  const gameLoop = useCallback(
    (time: number) => {
      if (gameOver || paused) return;

      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      dropCounterRef.current += deltaTime;
      if (dropCounterRef.current > dropTimeRef.current) {
        dropPlayer();
      }

      draw();
      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [draw, dropPlayer, gameOver, paused]
  );

  // 重置游戏
  const resetGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setPaused(false);
    boardRef.current = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    playerRef.current = createPiece();
    dropTimeRef.current = 1000;
    dropCounterRef.current = 0;
    lastTimeRef.current = 0;
    
    // 启动游戏循环
    cancelAnimationFrame(requestRef.current!);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [createPiece, gameLoop]);

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.code) {
        case 'ArrowLeft':
          movePlayer(-1);
          break;
        case 'ArrowRight':
          movePlayer(1);
          break;
        case 'ArrowDown':
          dropPlayer();
          break;
        case 'ArrowUp':
          playerRotate();
          break;
        case 'Space':
          e.preventDefault();
          hardDrop();
          break;
        case 'KeyP':
          setPaused((prev) => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropPlayer, gameOver, hardDrop, movePlayer, playerRotate]);

  // 启动游戏
  useEffect(() => {
    playerRef.current = createPiece();
    resetGame();

    return () => {
      cancelAnimationFrame(requestRef.current!);
    };
  }, [createPiece, resetGame]);

  // 暂停/恢复游戏
  useEffect(() => {
    if (!gameOver) {
      if (paused) {
        cancelAnimationFrame(requestRef.current!);
      } else {
        lastTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(gameLoop);
      }
    }
  }, [gameOver, paused, gameLoop]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        俄罗斯方块
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          分数: {score} | 等级: {level}
        </Typography>
        {gameOver && (
          <Typography variant="h6" color="error">
            游戏结束!
          </Typography>
        )}
      </Box>

      <Paper
        elevation={3}
        sx={{
          display: 'inline-block',
          p: 2,
          mb: 2,
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
          style={{ display: 'block' }}
        />

        {(gameOver || paused) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <Typography variant="h4" color="white">
              {paused ? '暂停' : '游戏结束'}
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" onClick={resetGame}>
          {gameOver ? '重新开始' : '重置游戏'}
        </Button>

        {!gameOver && (
          <Button
            variant="outlined"
            onClick={() => setPaused((prev) => !prev)}
          >
            {paused ? '继续' : '暂停'}
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          方向键控制移动和旋转，空格键快速下落，P键暂停游戏
        </Typography>
      </Box>
    </Box>
  );
};

export default TetrisGame; 