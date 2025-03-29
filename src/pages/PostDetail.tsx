import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { postAPI } from '../services/api';
import { Post } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (id) {
          const response = await postAPI.getPost(id);
          setPost(response.data);
        }
      } catch (err) {
        setError('获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleConfirmDelete = () => {
    setConfirmDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      if (id) {
        await postAPI.deletePost(id);
        setConfirmDialogOpen(false);
        navigate('/');
      }
    } catch (err) {
      setError('删除文章失败');
      setConfirmDialogOpen(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (id && comment.trim()) {
        const response = await postAPI.addComment(id, comment);
        setPost(response.data);
        setComment('');
      }
    } catch (err) {
      setError('添加评论失败');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!post) {
    return <Alert severity="error">找不到文章</Alert>;
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {post.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          作者: {post.author.username} | 发布时间: {new Date(post.createdAt).toLocaleDateString()}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" paragraph>
          {post.content}
        </Typography>

        {isAuthenticated && user && (post.author._id === user.userId || user.isAdmin) && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/edit/${post._id}`)}
            >
              编辑
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleConfirmDelete}
            >
              删除
            </Button>
          </Box>
        )}
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          评论 ({post.comments.length})
        </Typography>
        {post.comments.map((comment, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Typography variant="body1">{comment.content}</Typography>
            <Typography variant="caption" color="text.secondary">
              {`${comment.author.username} - ${new Date(comment.createdAt).toLocaleString()}`}
            </Typography>
          </Paper>
        ))}
      </Box>

      {isAuthenticated ? (
        <Box component="form" onSubmit={handleAddComment}>
          <Typography variant="h6" gutterBottom>
            添加评论
          </Typography>
          <TextField
            fullWidth
            label="评论内容"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <Button type="submit" variant="contained" disabled={!comment.trim()}>
            提交评论
          </Button>
        </Box>
      ) : (
        <Alert severity="info">
          请<Button color="primary" onClick={() => navigate('/login')}>登录</Button>后发表评论
        </Alert>
      )}

      {/* 删除确认对话框 */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除这篇文章吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>取消</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            确认删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostDetail; 