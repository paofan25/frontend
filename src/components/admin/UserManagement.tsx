import React, { useState, useEffect } from 'react';
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
    DialogActions,
    Switch,
    FormControlLabel
} from '@mui/material';
import axios from 'axios';

// 定义用户类型
interface User {
    _id: string;
    username: string;
    isAdmin: boolean;
    createdAt: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [adminUserId, setAdminUserId] = useState<string | null>(null);
    const [makeAdmin, setMakeAdmin] = useState(false);

    // 获取用户列表
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (err) {
                setError('获取用户列表失败');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // 删除用户对话框
    const handleDeleteConfirm = (userId: string) => {
        setDeleteUserId(userId);
    };

    const handleDeleteCancel = () => {
        setDeleteUserId(null);
    };

    const handleDelete = async () => {
        if (!deleteUserId) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/${deleteUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(user => user._id !== deleteUserId));
            setDeleteUserId(null);
        } catch (err) {
            setError('删除用户失败');
        }
    };

    // 修改管理员权限对话框
    const handleAdminConfirm = (userId: string, isAdmin: boolean) => {
        setAdminUserId(userId);
        setMakeAdmin(!isAdmin);
    };

    const handleAdminCancel = () => {
        setAdminUserId(null);
    };

    const handleAdminChange = async () => {
        if (!adminUserId) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/users/${adminUserId}`,
                { isAdmin: makeAdmin },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers(users.map(user =>
                user._id === adminUserId
                    ? { ...user, isAdmin: makeAdmin }
                    : user
            ));
            setAdminUserId(null);
        } catch (err) {
            setError('修改权限失败');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                用户管理
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
                                <TableCell>用户名</TableCell>
                                <TableCell>注册时间</TableCell>
                                <TableCell>管理员</TableCell>
                                <TableCell align="center">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={user.isAdmin}
                                                    onChange={() => handleAdminConfirm(user._id, user.isAdmin)}
                                                />
                                            }
                                            label=""
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteConfirm(user._id)}
                                        >
                                            删除
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        暂无用户
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* 删除用户对话框 */}
            <Dialog open={!!deleteUserId} onClose={handleDeleteCancel}>
                <DialogTitle>确认删除用户</DialogTitle>
                <DialogContent>
                    <Typography>
                        您确定要删除这个用户吗？此操作不可撤销。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>取消</Button>
                    <Button onClick={handleDelete} color="error">
                        删除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 修改管理员权限对话框 */}
            <Dialog open={!!adminUserId} onClose={handleAdminCancel}>
                <DialogTitle>修改管理员权限</DialogTitle>
                <DialogContent>
                    <Typography>
                        您确定要{makeAdmin ? '授予' : '撤销'}该用户的管理员权限吗？
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAdminCancel}>取消</Button>
                    <Button onClick={handleAdminChange} color="primary">
                        确认
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement; 