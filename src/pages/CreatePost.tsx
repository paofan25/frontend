import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { postAPI } from '../services/api';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await postAPI.createPost({ title, content });
      navigate(`/post/${response.data._id}`);
    } catch (error: any) {
      setError(error.response?.data?.error || '创建文章失败');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        创建新文章
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            multiline
            rows={10}
            required
          />
          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ mr: 1 }}
              disabled={!title.trim() || !content.trim()}
            >
              发布
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              取消
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreatePost; 