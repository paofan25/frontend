import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const BOARD_WIDTH = GRID_SIZE * CELL_SIZE;
const BOARD_HEIGHT = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 120;
const SPEED_INCREMENT = 5;

// 方向定义
enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT
}

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<{ x: number, y: number }[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<{ x: number, y: number }>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // 游戏循环
  const gameLoop = useCallback(() => {
    if (gameOver || paused) return;

    // 移动蛇
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case Direction.UP:
        head.y -= 1;
        break;
      case Direction.RIGHT:
        head.x += 1;
        break;
      case Direction.DOWN:
        head.y += 1;
        break;
      case Direction.LEFT:
        head.x -= 1;
        break;
    }

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      // 增加分数
      setScore(score + 10);
      // 生成新食物
      setFood(generateFood(newSnake));
      // 增加速度
      if (speed > 50) {
        setSpeed(speed - SPEED_INCREMENT);
      }
    } else {
      // 如果没吃到食物，移除尾部
      newSnake.pop();
    }

    // 检查是否碰撞墙壁
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // 检查是否碰撞自身
    for (const segment of newSnake) {
      if (segment.x === head.x && segment.y === head.y) {
        setGameOver(true);
        return;
      }
    }

    // 添加新头部
    newSnake.unshift(head);
    setSnake(newSnake);
  }, [direction, food, gameOver, paused, score, snake, speed]);

  // 随机生成食物
  const generateFood = (snakeBody: { x: number, y: number }[]): { x: number, y: number } => {
    let newFood: { x: number, y: number };
    let foodOnSnake: boolean;

    do {
      // 在循环内部创建一个新的变量，避免闭包引用外部变量
      const tempFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // 检查食物是否在蛇的身体上
      foodOnSnake = snakeBody.some(segment => segment.x === tempFood.x && segment.y === tempFood.y);
      if (!foodOnSnake) {
        newFood = tempFood;
      }
    } while (foodOnSnake);

    return newFood!;
  };

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
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, BOARD_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#4caf50' : '#8bc34a';
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      ctx.strokeStyle = '#388e3c';
      ctx.strokeRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });

    // 绘制食物
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [food, snake]);

  // 重置游戏
  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
    setDirection(Direction.RIGHT);
    setFood(generateFood([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]));
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setSpeed(INITIAL_SPEED);
  };

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.code) {
        case 'ArrowUp':
          if (direction !== Direction.DOWN) {
            setDirection(Direction.UP);
          }
          break;
        case 'ArrowRight':
          if (direction !== Direction.LEFT) {
            setDirection(Direction.RIGHT);
          }
          break;
        case 'ArrowDown':
          if (direction !== Direction.UP) {
            setDirection(Direction.DOWN);
          }
          break;
        case 'ArrowLeft':
          if (direction !== Direction.RIGHT) {
            setDirection(Direction.LEFT);
          }
          break;
        case 'KeyP':
          setPaused(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, gameOver]);

  // 游戏循环及绘制
  useEffect(() => {
    draw();

    if (!gameOver && !paused) {
      const timer = setTimeout(gameLoop, speed);
      return () => clearTimeout(timer);
    }
  }, [draw, gameLoop, gameOver, paused, speed]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        贪吃蛇
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          分数: {score} | 速度: {Math.floor((INITIAL_SPEED - speed) / SPEED_INCREMENT + 1)}
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
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
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
            onClick={() => setPaused(prev => !prev)}
          >
            {paused ? '继续' : '暂停'}
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          方向键控制移动，P键暂停游戏
        </Typography>
      </Box>
    </Box>
  );
};

export default SnakeGame; 