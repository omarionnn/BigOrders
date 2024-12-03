import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const FullMenu = () => {
  const { user } = useAuth();
  const { currentOrder, selectedRestaurant } = useOrder();
  const { cartItems, addToCart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (selectedRestaurant?.menu) {
      // Ensure each menu item has a dietaryInfo array
      const processedMenu = selectedRestaurant.menu.map(item => ({
        ...item,
        dietaryInfo: Array.isArray(item.dietaryInfo) ? item.dietaryInfo : []
      }));
      setMenuItems(processedMenu);
      setFilteredItems(processedMenu);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    let filtered = [...menuItems];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(item => item.price >= min && item.price <= max);
    }

    // Apply dietary filter
    if (dietaryFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.dietaryInfo.includes(dietaryFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.popularity - a.popularity;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredItems(filtered);
  }, [menuItems, searchQuery, sortBy, filterCategory, priceRange, dietaryFilter]);

  const handleAddToCart = () => {
    addToCart(selectedItem, quantity, specialInstructions);
    setSelectedItem(null);
    setQuantity(1);
    setSpecialInstructions('');
  };

  const getCategories = () => {
    return ['all', ...new Set(menuItems.map(item => item.category))];
  };

  const getDietaryOptions = () => {
    const options = new Set();
    menuItems.forEach(item => {
      if (Array.isArray(item.dietaryInfo)) {
        item.dietaryInfo.forEach(diet => options.add(diet));
      }
    });
    return ['all', ...Array.from(options)];
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!selectedRestaurant) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4, textAlign: 'center' }}>
          Please select a restaurant first
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography
          component={motion.h1}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          variant="h4"
        >
          {selectedRestaurant.name} - Full Menu
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={() => setIsCartOpen(true)}
        >
          Cart (${getCartTotal().toFixed(2)})
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="popularity">Popularity</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6">
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {item.description}
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      {Array.isArray(item.dietaryInfo) && item.dietaryInfo.map((diet) => (
                        <Chip
                          key={diet}
                          label={diet}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h6" color="primary">
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Rating value={item.rating} readOnly size="small" />
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => setSelectedItem(item)}
                    >
                      Add to Order
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Add to Cart Dialog */}
      <Dialog
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add to Order</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">{selectedItem.name}</Typography>
                <Typography color="text.secondary">
                  ${selectedItem.price.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ mx: 2 }}>{quantity}</Typography>
                <IconButton onClick={() => setQuantity(quantity + 1)}>
                  <AddIcon />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Your Cart
          </Typography>
          <List>
            {cartItems.map((cartItem) => (
              <React.Fragment key={cartItem.item._id}>
                <ListItem>
                  <ListItemText
                    primary={cartItem.item.name}
                    secondary={
                      <>
                        ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                        {cartItem.specialInstructions && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Note: {cartItem.specialInstructions}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(
                            cartItem.item._id,
                            Math.max(0, cartItem.quantity - 1)
                          )
                        }
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 1 }}>{cartItem.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(
                            cartItem.item._id,
                            cartItem.quantity + 1
                          )
                        }
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total: ${getCartTotal().toFixed(2)}
            </Typography>
            <Button variant="contained" fullWidth>
              Proceed to Checkout
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {getCategories().map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Price Range</InputLabel>
            <Select
              value={priceRange}
              label="Price Range"
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <MenuItem value="all">All Prices</MenuItem>
              <MenuItem value="0-10">Under $10</MenuItem>
              <MenuItem value="10-20">$10 - $20</MenuItem>
              <MenuItem value="20-30">$20 - $30</MenuItem>
              <MenuItem value="30-100">$30+</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Dietary Preferences</InputLabel>
            <Select
              value={dietaryFilter}
              label="Dietary Preferences"
              onChange={(e) => setDietaryFilter(e.target.value)}
            >
              {getDietaryOptions().map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setFilterCategory('all');
              setPriceRange('all');
              setDietaryFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </Box>
      </Drawer>
    </Container>
  );
};

export default FullMenu;
