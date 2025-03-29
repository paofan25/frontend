import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          我的博客
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/games">
            小游戏
          </Button>
          {isLoggedIn ? (
            <>
              <Button color="inherit" component={Link} to="/create">
                发布文章
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                退出
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                登录
              </Button>
              <Button color="inherit" component={Link} to="/register">
                注册
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}; 