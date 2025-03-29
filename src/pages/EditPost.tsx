import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import { postAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const EditPost: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, user, isLoading } = useAuth();

    useEffect(() => {
        const fetchPost = async () => {
            if (isLoading) return; // 等待身份验证状态加载完成

            try {
                if (id) {
                    // 先检查是否登录
                    if (!isAuthenticated) {
                        setError('请先登录');
                        setLoading(false);
                        return;
                    }

                    const response = await postAPI.getPost(id);
                    const post = response.data;

                    // 设置文章内容
                    setTitle(post.title);
                    setContent(post.content);

                    // 检查权限
                    if (user && !(post.author._id === user.userId || user.isAdmin)) {
                        setError('您没有权限编辑此文章');
                    }
                }
            } catch (err) {
                setError('获取文章失败');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, isAuthenticated, user, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setError('请先登录');
            return;
        }

        setError('');
        setSuccess(false);

        try {
            if (id) {
                await postAPI.updatePost(id, { title, content });
                setSuccess(true);

                // 短暂显示成功消息后跳转
                setTimeout(() => {
                    navigate(`/post/${id}`);
                }, 1500);
            }
        } catch (error: any) {
            setError(error.response?.data?.error || '更新文章失败');
        }
    };

    const handleLogin = () => {
        navigate('/login', { state: { returnUrl: `/edit/${id}` } });
    };

    if (isLoading || loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    编辑文章
                </Typography>

                {error && error.includes('请先登录') ? (
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                        action={
                            <Button color="inherit" size="small" onClick={handleLogin}>
                                去登录
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                ) : error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        文章更新成功，正在跳转...
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="标题"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="normal"
                        required
                        disabled={!!error}
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
                        disabled={!!error}
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!title.trim() || !content.trim() || !!error}
                        >
                            更新
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/post/${id}`)}
                        >
                            取消
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default EditPost; 