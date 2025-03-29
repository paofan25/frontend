import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { postAPI } from '../../services/api';
import { Post } from '../../types';

const PostManagement: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletePostId, setDeletePostId] = useState<string | null>(null);
    const navigate = useNavigate();

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

    const handleEdit = (postId: string) => {
        navigate(`/edit/${postId}`);
    };

    const handleView = (postId: string) => {
        navigate(`/post/${postId}`);
    };

    const handleDeleteConfirm = (postId: string) => {
        setDeletePostId(postId);
    };

    const handleDeleteCancel = () => {
        setDeletePostId(null);
    };

    const handleDelete = async () => {
        if (!deletePostId) return;

        try {
            await postAPI.deletePost(deletePostId);
            setPosts(posts.filter(post => post._id !== deletePostId));
            setDeletePostId(null);
        } catch (err) {
            setError('删除文章失败');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                文章管理
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>标题</TableCell>
                                <TableCell>作者</TableCell>
                                <TableCell>发布时间</TableCell>
                                <TableCell>评论数</TableCell>
                                <TableCell align="center">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post._id}>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{post.author.username}</TableCell>
                                    <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{post.comments.length}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            size="small"
                                            onClick={() => handleView(post._id)}
                                            sx={{ mr: 1 }}
                                        >
                                            查看
                                        </Button>
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={() => handleEdit(post._id)}
                                            sx={{ mr: 1 }}
                                        >
                                            编辑
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteConfirm(post._id)}
                                        >
                                            删除
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {posts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        暂无文章
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={!!deletePostId} onClose={handleDeleteCancel}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        您确定要删除这篇文章吗？此操作不可撤销。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>取消</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        删除
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PostManagement; 