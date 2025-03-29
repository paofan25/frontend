import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import { Post } from '../types';
import { useAuth } from '../hooks/useAuth';

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postAPI.getAllPosts();
        setPosts(response.data);
      } catch (err) {
        setError('获取文章列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (posts.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">暂无文章</Typography>
        {isAuthenticated && (
          <Button
            component={Link}
            to="/create"
            variant="contained"
            sx={{ mt: 2 }}
          >
            发布第一篇文章
          </Button>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <List>
        {posts.map((post, index) => (
          <React.Fragment key={post._id}>
            <ListItem
              alignItems="flex-start"
              component={Link}
              to={`/post/${post._id}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="h6" color="primary">
                    {post.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      作者: {post.author.username} | 发布时间: {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.content.length > 100
                        ? `${post.content.substring(0, 100)}...`
                        : post.content}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        评论: {post.comments.length} |
                        {isAdmin &&
                          <Button
                            component={Link}
                            to={`/post/${post._id}`}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            管理
                          </Button>
                        }
                      </Typography>
                    </Box>
                  </>
                }
              />
            </ListItem>
            {index < posts.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}; 