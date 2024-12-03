import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionCard = motion(Card);

const Landing = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <GroupIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Group Ordering Made Easy',
      description: 'Create or join group orders with a simple 4-digit pin system',
    },
    {
      icon: <LocalOfferIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Exclusive Discounts',
      description: 'Get special discounts on large orders from your favorite restaurants',
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Support Local Restaurants',
      description: 'Help local restaurants grow while enjoying your favorite meals',
    },
    {
      icon: <ThumbUpIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Personalized Recommendations',
      description: 'Get dish recommendations based on your taste profile',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: 12,
          pb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <MotionTypography
                  variant="h2"
                  component="h1"
                  sx={{ fontWeight: 700, mb: 3 }}
                >
                  Order Together,
                  <br />
                  Save Together
                </MotionTypography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Join BigOrders and experience the joy of group ordering with
                  personalized recommendations and exclusive discounts.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                    mr: 2,
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'grey.100',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Login
                </Button>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="img"
                  src="/hero-image.png"
                  alt="Group ordering illustration"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    display: { xs: 'none', md: 'block' },
                  }}
                />
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Why Choose BigOrders?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Card
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'white',
              borderRadius: 4,
              boxShadow: 3,
            }}
          >
            <Typography variant="h4" component="h3" sx={{ mb: 3 }}>
              Ready to Start Ordering Together?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Join BigOrders today and experience the future of group ordering.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ minWidth: 200 }}
            >
              Get Started Now
            </Button>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
