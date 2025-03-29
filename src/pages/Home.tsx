import React from 'react';
import { Box, Typography } from '@mui/material';
import { PostList } from '../components/PostList';

const Home: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        博客首页
      </Typography>
      <PostList />
    </Box>
  );
};

export default Home; 