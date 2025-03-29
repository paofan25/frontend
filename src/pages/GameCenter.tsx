import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid
} from '@mui/material';
import TetrisGame from '../games/TetrisGame';
import SnakeGame from '../games/SnakeGame';
import MinesweeperGame from '../games/MinesweeperGame';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`game-tabpanel-${index}`}
      aria-labelledby={`game-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const GameCenter: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setGameStarted(false);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        游戏中心
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="贪吃蛇" />
          <Tab label="俄罗斯方块" />
          <Tab label="扫雷" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {gameStarted ? (
            <SnakeGame />
          ) : (
            <GameCard
              title="贪吃蛇"
              description="经典贪吃蛇游戏，使用方向键控制蛇的移动，吃到食物可以增加长度和分数！"
              image="https://via.placeholder.com/400x200?text=Snake"
              onStart={startGame}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {gameStarted ? (
            <TetrisGame />
          ) : (
            <GameCard
              title="俄罗斯方块"
              description="经典俄罗斯方块游戏，使用方向键控制方块移动和旋转，争取更高的分数！"
              image="https://via.placeholder.com/400x200?text=Tetris"
              onStart={startGame}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {gameStarted ? (
            <MinesweeperGame />
          ) : (
            <GameCard
              title="扫雷"
              description="经典扫雷游戏，点击格子找出所有的安全区域，避免触发地雷。"
              image="https://via.placeholder.com/400x200?text=Minesweeper"
              onStart={startGame}
            />
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  onStart: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, image, onStart }) => {
  return (
    <Grid container justifyContent="center">
      <Card sx={{ maxWidth: 600, m: 2 }}>
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onStart}
          >
            开始游戏
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default GameCenter; 