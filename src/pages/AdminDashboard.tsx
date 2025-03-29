import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import UserManagement from '../components/admin/UserManagement';
import PostManagement from '../components/admin/PostManagement';

const AdminDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // 检查管理员权限
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/login', { state: { returnUrl: '/admin' } });
    }
  }, [isAuthenticated, isAdmin, navigate, isLoading]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Alert severity="error">您没有访问权限</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        管理后台
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="用户管理" />
          <Tab label="文章管理" />
        </Tabs>
      </Paper>

      {tabIndex === 0 && <UserManagement />}
      {tabIndex === 1 && <PostManagement />}
    </Box>
  );
};

export default AdminDashboard; 