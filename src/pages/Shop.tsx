import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Box,
    Tabs,
    Tab,
    Chip,
    CircularProgress,
    Alert,
    Pagination,
    Paper
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { ShopItem } from '../types';
import axios from 'axios';

const ITEMS_PER_PAGE = 6;

const Shop: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [items, setItems] = useState<ShopItem[]>([]);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);

    // 模拟商城数据
    const mockShopItems: ShopItem[] = [
        {
            id: 'gold-theme',
            name: '黄金主题',
            description: '尊贵的金色主题，展示您的财富和地位',
            price: 2000,
            imageUrl: '/skins/skin3.jpg',
            category: 'skin',
            rarity: 'legendary'
        },
        {
            id: 'green-theme',
            name: '翡翠主题',
            description: '清新的绿色主题，给人以自然和平静的感觉',
            price: 800,
            imageUrl: '/skins/skin4.jpg',
            category: 'skin',
            rarity: 'epic'
        },
        {
            id: 'space-theme',
            name: '星际主题',
            description: '神秘的太空主题，带您遨游宇宙',
            price: 1200,
            imageUrl: '/skins/skin5.jpg',
            category: 'skin',
            rarity: 'epic'
        },
        {
            id: 'vip-avatar1',
            name: 'VIP头像',
            description: '专属VIP用户的高级头像',
            price: 500,
            imageUrl: '/avatars/avatar1.jpg',
            category: 'avatar',
            rarity: 'rare'
        },
        {
            id: 'vip-avatar2',
            name: '金色头像',
            description: '闪闪发光的金色头像，彰显您的尊贵',
            price: 800,
            imageUrl: '/avatars/avatar2.jpg',
            category: 'avatar',
            rarity: 'epic'
        },
        {
            id: 'vip-avatar3',
            name: '红宝石头像',
            description: '罕见的红宝石风格头像',
            price: 1000,
            imageUrl: '/avatars/avatar3.jpg',
            category: 'avatar',
            rarity: 'epic'
        },
        {
            id: 'vip-avatar4',
            name: '钻石头像',
            description: '珍贵的钻石风格头像，彰显您的身份',
            price: 1500,
            imageUrl: '/avatars/avatar4.jpg',
            category: 'avatar',
            rarity: 'legendary'
        },
        {
            id: 'double-coin',
            name: '双倍金币卡',
            description: '使用后一周内游戏奖励双倍金币',
            price: 300,
            imageUrl: '/items/double-coin.png',
            category: 'boost',
            rarity: 'common'
        },
        {
            id: 'extra-life',
            name: '额外生命',
            description: '在游戏中提供一次额外的生命机会',
            price: 150,
            imageUrl: '/items/extra-life.png',
            category: 'boost',
            rarity: 'common'
        },
        {
            id: 'lucky-charm',
            name: '幸运符',
            description: '增加获得稀有物品的概率',
            price: 450,
            imageUrl: '/items/lucky-charm.png',
            category: 'accessory',
            rarity: 'rare'
        }
    ];

    useEffect(() => {
        const loadItems = async () => {
            try {
                setLoading(true);
                // 在实际应用中，应该通过API获取商城数据
                // const response = await axios.get('/api/shop/items');
                // setItems(response.data);

                // 使用模拟数据
                setTimeout(() => {
                    setItems(mockShopItems);
                    setLoading(false);
                }, 500);
            } catch (err) {
                setError('加载商城数据失败');
                setLoading(false);
            }
        };

        loadItems();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
        setPage(1);
    };

    const handleBuyItem = async (item: ShopItem) => {
        try {
            setError('');
            setSuccess('');

            // 检查钱包余额
            if (user && (user.wallet || 0) < item.price) {
                setError('钱包余额不足，无法购买此物品');
                return;
            }

            // 在实际应用中，应该通过API购买物品
            // await axios.post('/api/shop/purchase', {
            //     itemId: item.id
            // }, {
            //     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            // });

            // 模拟购买成功
            setSuccess(`您已成功购买 ${item.name}！`);
        } catch (err) {
            setError('购买失败，请稍后再试');
        }
    };

    const filteredItems = activeTab === 'all'
        ? items
        : items.filter(item => item.category === activeTab);

    const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    const displayedItems = filteredItems.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    商城中心
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

                {isAuthenticated && user && (
                    <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Chip
                            color="primary"
                            label={`钱包余额: ${user.wallet || 0} 金币`}
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Paper>
                )}

                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        centered
                        variant="fullWidth"
                    >
                        <Tab label="全部" value="all" />
                        <Tab label="皮肤" value="skin" />
                        <Tab label="头像" value="avatar" />
                        <Tab label="装饰品" value="accessory" />
                        <Tab label="加成道具" value="boost" />
                    </Tabs>
                </Paper>

                <Grid container spacing={3}>
                    {displayedItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.03)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    height="180"
                                    image={item.imageUrl}
                                    alt={item.name}
                                    sx={{ objectFit: 'contain', bgcolor: '#f5f5f5', pt: 2 }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Chip
                                            size="small"
                                            label={item.rarity}
                                            color={
                                                item.rarity === 'legendary' ? 'error' :
                                                    item.rarity === 'epic' ? 'warning' :
                                                        item.rarity === 'rare' ? 'info' : 'success'
                                            }
                                        />
                                        <Chip
                                            size="small"
                                            color="primary"
                                            label={`${item.price} 金币`}
                                        />
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleBuyItem(item)}
                                        disabled={!isAuthenticated || (user ? (user.wallet || 0) < item.price : false)}
                                    >
                                        {isAuthenticated ? '购买' : '请先登录'}
                                    </Button>
                                </CardActions>
                                {isAuthenticated && user && (user.wallet || 0) < item.price && (
                                    <Typography variant="caption" color="error" align="center" sx={{ pb: 1 }}>
                                        余额不足
                                    </Typography>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {pageCount > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={pageCount}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Shop; 