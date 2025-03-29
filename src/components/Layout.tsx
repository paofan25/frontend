import React, { useState } from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button, CircularProgress, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  // 导航项
  const navItems = [
    { title: '首页', path: '/' },
    { title: '游戏中心', path: '/games' },
    { title: '商城', path: '/shop' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
            component={RouterLink}
            to="/"
          >
            博客系统
          </Typography>

          <Button color="inherit" component={RouterLink} to="/games" sx={{ mr: 1 }}>
            游戏中心
          </Button>

          <Button color="inherit" component={RouterLink} to="/shop" sx={{ mr: 1 }}>
            商城
          </Button>

          {isLoading ? (
            <CircularProgress color="inherit" size={24} />
          ) : isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/create" sx={{ mr: 1 }}>
                发布文章
              </Button>

              {isAdmin && (
                <Button color="inherit" component={RouterLink} to="/admin" sx={{ mr: 1 }}>
                  管理后台
                </Button>
              )}

              <Button
                color="inherit"
                onClick={handleClick}
                startIcon={
                  <Avatar
                    src={user?.avatar}
                    alt={user?.username}
                    sx={{ width: 24, height: 24 }}
                  />
                }
              >
                {user?.username}
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem component={RouterLink} to="/profile">
                  个人中心
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>退出登录</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                登录
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                注册
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 3, bgcolor: 'primary.main', color: 'white', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} 博客系统 - 版权所有
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 