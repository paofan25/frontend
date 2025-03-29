import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Button,
    Grid,
    TextField,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    CircularProgress,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tabs,
    Tab,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Chip
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { Skin } from '../types';

const avatarOptions = [
    '/avatars/avatar1.jpg',
    '/avatars/avatar2.jpg',
    '/avatars/avatar3.jpg',
    '/avatars/avatar4.jpg',
    '/avatars/avatar5.jpg',
    '/avatars/avatar6.jpg',
];

const Profile: React.FC = () => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [selectedSkin, setSelectedSkin] = useState('');
    const [purchasedSkins, setPurchasedSkins] = useState<Skin[]>([]);
    const [availableSkins, setAvailableSkins] = useState<Skin[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }

        // 设置当前用户头像和皮肤
        if (user) {
            setSelectedAvatar(user.avatar || '/avatars/avatar1.jpg');
            setSelectedSkin(user.activeSkin || 'default');
        }

        // 加载已购买的皮肤
        const loadPurchasedSkins = async () => {
            try {
                setLoading(true);
                // 模拟已购买的皮肤数据
                const mockPurchasedSkins: Skin[] = [
                    {
                        id: 'default',
                        name: '默认皮肤',
                        description: '系统默认皮肤',
                        price: 0,
                        imageUrl: '/skins/skin1.jpg',
                        category: 'theme',
                        rarity: 'common'
                    },
                    {
                        id: 'blue-theme',
                        name: '深蓝主题',
                        description: '优雅的深蓝色调主题',
                        price: 500,
                        imageUrl: '/skins/skin2.jpg',
                        category: 'theme',
                        rarity: 'rare'
                    }
                ];

                setPurchasedSkins(mockPurchasedSkins);

                // 模拟可购买的皮肤
                const mockAvailableSkins: Skin[] = [
                    {
                        id: 'gold-theme',
                        name: '黄金主题',
                        description: '尊贵的金色主题，展示您的财富',
                        price: 2000,
                        imageUrl: '/skins/skin3.jpg',
                        category: 'theme',
                        rarity: 'legendary'
                    },
                    {
                        id: 'green-theme',
                        name: '翡翠主题',
                        description: '清新的绿色主题，给人以自然感',
                        price: 800,
                        imageUrl: '/skins/skin4.jpg',
                        category: 'theme',
                        rarity: 'epic'
                    },
                    {
                        id: 'space-theme',
                        name: '星际主题',
                        description: '神秘的太空主题，带您遨游宇宙',
                        price: 1200,
                        imageUrl: '/skins/skin5.jpg',
                        category: 'theme',
                        rarity: 'epic'
                    }
                ];

                setAvailableSkins(mockAvailableSkins);
            } catch (err) {
                setError('加载皮肤数据失败');
            } finally {
                setLoading(false);
            }
        };

        loadPurchasedSkins();
    }, [isAuthenticated, isLoading, navigate, user]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleAvatarChange = async (avatar: string) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // 这里应该调用API来更新用户的头像
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/me',
                { avatar },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSelectedAvatar(avatar);
            setSuccess('头像更新成功！');
        } catch (err) {
            setError('更新头像失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSkinChange = async (skinId: string) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // 这里应该调用API来更新用户的皮肤
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/me',
                { activeSkin: skinId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSelectedSkin(skinId);
            setSuccess('皮肤应用成功！');
        } catch (err) {
            setError('应用皮肤失败');
        } finally {
            setLoading(false);
        }
    };

    const handleBuySkin = async (skin: Skin) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // 检查钱包余额
            if (user && (user.wallet || 0) < skin.price) {
                setError('钱包余额不足，无法购买此皮肤');
                setLoading(false);
                return;
            }

            // 这里应该调用API来购买皮肤
            const token = localStorage.getItem('token');
            await axios.post('/api/shop/purchase',
                { skinId: skin.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 更新已购买皮肤列表
            setPurchasedSkins([...purchasedSkins, skin]);

            // 从可购买列表中移除
            setAvailableSkins(availableSkins.filter(s => s.id !== skin.id));

            setSuccess('皮肤购买成功！');
        } catch (err) {
            setError('购买皮肤失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setLoading(true);

            // 这里应该调用API来删除用户账户
            const token = localStorage.getItem('token');
            await axios.delete('/api/auth/me',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 注销并返回首页
            logout();
            navigate('/');
        } catch (err) {
            setError('注销账户失败');
            setConfirmDelete(false);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const renderProfileInfo = () => (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                    src={selectedAvatar}
                    alt={user.username}
                    sx={{ width: 96, height: 96, mr: 3 }}
                />
                <Box>
                    <Typography variant="h5">{user.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user.isAdmin ? '管理员' : '普通用户'}
                    </Typography>
                    <Chip
                        color="primary"
                        label={`钱包余额: ${user.wallet} 金币`}
                        sx={{ mt: 1 }}
                    />
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>账户操作</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirmDelete(true)}
                >
                    注销账户
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => setConfirmLogout(true)}
                >
                    退出登录
                </Button>
            </Box>
        </Paper>
    );

    const renderAvatarSettings = () => (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>选择头像</Typography>
            <Grid container spacing={2}>
                {avatarOptions.map((avatar, index) => (
                    <Grid item key={index}>
                        <Avatar
                            src={avatar}
                            sx={{
                                width: 64,
                                height: 64,
                                cursor: 'pointer',
                                border: avatar === selectedAvatar ? '2px solid #1976d2' : 'none',
                                '&:hover': { opacity: 0.8 }
                            }}
                            onClick={() => handleAvatarChange(avatar)}
                        />
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );

    const renderSkinSettings = () => (
        <>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>已购皮肤</Typography>
                <Grid container spacing={2}>
                    {purchasedSkins.map((skin) => (
                        <Grid item xs={12} sm={6} md={4} key={skin.id}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={skin.imageUrl || `/skins/skin1.jpg`}
                                    alt={skin.name}
                                />
                                <CardContent>
                                    <Typography variant="h6">{skin.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {skin.description}
                                    </Typography>
                                    <Chip
                                        label={skin.rarity}
                                        size="small"
                                        color={
                                            skin.rarity === 'legendary' ? 'error' :
                                                skin.rarity === 'epic' ? 'warning' :
                                                    skin.rarity === 'rare' ? 'info' : 'success'
                                        }
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        variant={selectedSkin === skin.id ? 'contained' : 'outlined'}
                                        onClick={() => handleSkinChange(skin.id)}
                                        disabled={selectedSkin === skin.id}
                                    >
                                        {selectedSkin === skin.id ? '已应用' : '应用'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                    {purchasedSkins.length === 0 && (
                        <Box sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                            <Typography>您还没有购买任何皮肤</Typography>
                        </Box>
                    )}
                </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>商城皮肤</Typography>
                <Grid container spacing={2}>
                    {availableSkins.map((skin) => (
                        <Grid item xs={12} sm={6} md={4} key={skin.id}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={skin.imageUrl || `/skins/skin1.jpg`}
                                    alt={skin.name}
                                />
                                <CardContent>
                                    <Typography variant="h6">{skin.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {skin.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                        <Chip
                                            label={skin.rarity}
                                            size="small"
                                            color={
                                                skin.rarity === 'legendary' ? 'error' :
                                                    skin.rarity === 'epic' ? 'warning' :
                                                        skin.rarity === 'rare' ? 'info' : 'success'
                                            }
                                        />
                                        <Chip
                                            label={`${skin.price} 金币`}
                                            size="small"
                                            color="primary"
                                        />
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleBuySkin(skin)}
                                        disabled={(user?.wallet || 0) < skin.price || loading}
                                    >
                                        购买
                                    </Button>
                                    {(user?.wallet || 0) < skin.price && (
                                        <Typography variant="caption" color="error">
                                            余额不足
                                        </Typography>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                    {availableSkins.length === 0 && (
                        <Box sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                            <Typography>商城暂无可购买皮肤</Typography>
                        </Box>
                    )}
                </Grid>
            </Paper>
        </>
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    个人中心
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        centered
                        variant="fullWidth"
                    >
                        <Tab label="个人信息" />
                        <Tab label="头像设置" />
                        <Tab label="皮肤装扮" />
                    </Tabs>
                </Paper>

                {activeTab === 0 && renderProfileInfo()}
                {activeTab === 1 && renderAvatarSettings()}
                {activeTab === 2 && renderSkinSettings()}
            </Box>

            {/* 退出登录确认对话框 */}
            <Dialog
                open={confirmLogout}
                onClose={() => setConfirmLogout(false)}
            >
                <DialogTitle>确认退出登录</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        您确定要退出登录吗？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmLogout(false)}>取消</Button>
                    <Button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        color="primary"
                    >
                        确认退出
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 注销账户确认对话框 */}
            <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
            >
                <DialogTitle>确认注销账户</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        您确定要注销账户吗？此操作将永久删除您的账户和所有相关数据，且无法恢复。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(false)}>取消</Button>
                    <Button
                        onClick={handleDeleteAccount}
                        color="error"
                    >
                        确认注销
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile; 