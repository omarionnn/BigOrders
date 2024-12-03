import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  LinearProgress,
  Chip,
  Slide,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';

const SwipeCard = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  maxWidth: 400,
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
}));

const Game = () => {
  const { user, updateUser } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [gameStats, setGameStats] = useState({
    likes: 0,
    dislikes: 0,
    superLikes: 0,
    preferences: {},
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // In a real app, this would come from an API
  useEffect(() => {
    const sampleDishes = [
      {
        id: 1,
        name: 'Spicy Tuna Roll',
        image: 'https://example.com/spicy-tuna.jpg',
        cuisine: 'Japanese',
        spicyLevel: 3,
        price: 12.99,
        description: 'Fresh tuna with spicy mayo and cucumber',
        tags: ['Spicy', 'Seafood', 'Raw'],
        dietaryInfo: ['Pescatarian', 'Gluten-Free'],
        popularity: 4.5,
      },
      // Add more sample dishes here
    ];

    setDishes(sampleDishes);
  }, []);

  const handleSwipe = (direction, superLike = false) => {
    if (currentIndex >= dishes.length) return;

    const dish = dishes[currentIndex];
    setDirection(direction);

    // Update game stats
    setGameStats(prev => {
      const newStats = {
        ...prev,
        preferences: { ...prev.preferences },
      };

      if (direction === 'right' || superLike) {
        newStats.likes++;
        // Update cuisine preference
        newStats.preferences[dish.cuisine] = (newStats.preferences[dish.cuisine] || 0) + (superLike ? 2 : 1);
        // Update spiciness preference
        if (dish.spicyLevel > 0) {
          newStats.preferences.spicyPreference = (newStats.preferences.spicyPreference || 0) + dish.spicyLevel;
        }
        // Update tags preferences
        dish.tags.forEach(tag => {
          newStats.preferences[tag] = (newStats.preferences[tag] || 0) + (superLike ? 2 : 1);
        });
      } else {
        newStats.dislikes++;
      }

      if (superLike) {
        newStats.superLikes++;
      }

      return newStats;
    });

    // Move to next dish after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      setDragPosition({ x: 0, y: 0 });
    }, 300);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const swipeThreshold = 100;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      handleSwipe(info.offset.x > 0 ? 'right' : 'left');
    } else {
      setDragPosition({ x: 0, y: 0 });
    }
  };

  const calculateTasteProfile = () => {
    const { preferences } = gameStats;
    const totalSwipes = gameStats.likes + gameStats.dislikes;

    // Normalize preferences
    const normalizedPreferences = {};
    Object.entries(preferences).forEach(([key, value]) => {
      normalizedPreferences[key] = value / totalSwipes;
    });

    // Update user's taste profile
    updateUser({
      ...user,
      tasteProfile: {
        ...user.tasteProfile,
        ...normalizedPreferences,
        lastUpdated: new Date().toISOString(),
      },
    });

    setShowResults(true);
  };

  const getSwipeCardStyle = () => {
    if (direction === 'right') {
      return {
        x: 1000,
        opacity: 0,
        transition: { duration: 0.3 },
      };
    }
    if (direction === 'left') {
      return {
        x: -1000,
        opacity: 0,
        transition: { duration: 0.3 },
      };
    }
    return {
      x: dragPosition.x,
      y: dragPosition.y,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    };
  };

  const renderCard = () => {
    if (currentIndex >= dishes.length) {
      return null;
    }

    const dish = dishes[currentIndex];
    const rotation = dragPosition.x * 0.1;
    const opacity = Math.min(Math.abs(dragPosition.x) / 100, 1);

    return (
      <SwipeCard
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        onDragStart={() => setIsDragging(true)}
        onDrag={(e, info) => setDragPosition({ x: info.offset.x, y: info.offset.y })}
        onDragEnd={handleDragEnd}
        animate={getSwipeCardStyle()}
        style={{ rotate: rotation }}
      >
        <Card sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 2,
              transform: 'rotate(-30deg)',
              opacity: dragPosition.x > 50 ? opacity : 0,
            }}
          >
            <Typography variant="h4" color="success.main" fontWeight="bold">
              YUM!
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 2,
              transform: 'rotate(30deg)',
              opacity: dragPosition.x < -50 ? opacity : 0,
            }}
          >
            <Typography variant="h4" color="error.main" fontWeight="bold">
              NOPE
            </Typography>
          </Box>
          <CardMedia
            component="img"
            height="300"
            image={dish.image}
            alt={dish.name}
          />
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {dish.name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {dish.description}
            </Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              {dish.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
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
                ${dish.price.toFixed(2)}
              </Typography>
              <Rating value={dish.popularity} readOnly size="small" />
            </Box>
          </CardContent>
        </Card>
      </SwipeCard>
    );
  };

  const renderGameControls = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        mt: 4,
      }}
    >
      <IconButton
        size="large"
        onClick={() => handleSwipe('left')}
        sx={{
          backgroundColor: 'error.light',
          color: 'white',
          '&:hover': { backgroundColor: 'error.main' },
        }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>
      <IconButton
        size="large"
        onClick={() => handleSwipe('right', true)}
        sx={{
          backgroundColor: 'warning.light',
          color: 'white',
          '&:hover': { backgroundColor: 'warning.main' },
        }}
      >
        <StarIcon fontSize="large" />
      </IconButton>
      <IconButton
        size="large"
        onClick={() => handleSwipe('right')}
        sx={{
          backgroundColor: 'success.light',
          color: 'white',
          '&:hover': { backgroundColor: 'success.main' },
        }}
      >
        <FavoriteIcon fontSize="large" />
      </IconButton>
    </Box>
  );

  const renderProgress = () => {
    const progress = (currentIndex / dishes.length) * 100;
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {currentIndex} / {dishes.length} dishes
        </Typography>
      </Box>
    );
  };

  const renderResults = () => (
    <Dialog open={showResults} maxWidth="sm" fullWidth>
      <DialogTitle>Your Taste Profile Results</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Swipe Statistics
          </Typography>
          <Typography>Likes: {gameStats.likes}</Typography>
          <Typography>Super Likes: {gameStats.superLikes}</Typography>
          <Typography>Dislikes: {gameStats.dislikes}</Typography>
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom>
            Discovered Preferences
          </Typography>
          {Object.entries(gameStats.preferences)
            .sort(([, a], [, b]) => b - a)
            .map(([key, value]) => (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography sx={{ minWidth: 120 }}>{key}:</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(value / (gameStats.likes + gameStats.superLikes)) * 100}
                  sx={{ flexGrow: 1, mx: 2 }}
                />
                <Typography variant="body2">
                  {Math.round((value / (gameStats.likes + gameStats.superLikes)) * 100)}%
                </Typography>
              </Box>
            ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => {
            setShowResults(false);
            setCurrentIndex(0);
            setGameStats({
              likes: 0,
              dislikes: 0,
              superLikes: 0,
              preferences: {},
            });
          }}
        >
          Play Again
        </Button>
        <Button variant="contained" onClick={() => setShowResults(false)}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography
        component={motion.h1}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        variant="h4"
        gutterBottom
        align="center"
      >
        Food Discovery Game
      </Typography>
      <Typography
        color="text.secondary"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        Swipe right to like, left to dislike, or up to super like!
      </Typography>

      <Box
        sx={{
          position: 'relative',
          height: 500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <AnimatePresence>
          {currentIndex < dishes.length ? (
            renderCard()
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                No more dishes to swipe!
              </Typography>
              <Button
                variant="contained"
                onClick={calculateTasteProfile}
                sx={{ mt: 2 }}
              >
                View Results
              </Button>
            </Box>
          )}
        </AnimatePresence>
      </Box>

      {currentIndex < dishes.length && renderGameControls()}
      {renderProgress()}
      {renderResults()}
    </Container>
  );
};

export default Game;
