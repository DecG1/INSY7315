import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Divider, Grid } from "@mui/material";
import { Receipt, Plus, Trash2, Save } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { currency } from "./helpers.js";
import { addSale } from "./analyticsService.js";
import HintTooltip from "./HintTooltip.jsx";
import { logOrderCreated } from "./auditService.js";

const ScannerPage = () => {
  // Order items organized by category
  const [food, setFood] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [dessert, setDessert] = useState([]);
  const [other, setOther] = useState([]);
  
  // Payment fields
  const [amountPaid, setAmountPaid] = useState("");
  
  // Add item to category
  const addItem = (category) => {
    const newItem = { id: Date.now(), name: "", price: "" };
    switch(category) {
      case 'food': setFood([...food, newItem]); break;
      case 'drinks': setDrinks([...drinks, newItem]); break;
      case 'dessert': setDessert([...dessert, newItem]); break;
      case 'other': setOther([...other, newItem]); break;
    }
  };
  
  // Update item field
  const updateItem = (category, id, field, value) => {
    const updateFn = (items) => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    switch(category) {
      case 'food': setFood(updateFn(food)); break;
      case 'drinks': setDrinks(updateFn(drinks)); break;
      case 'dessert': setDessert(updateFn(dessert)); break;
      case 'other': setOther(updateFn(other)); break;
    }
  };
  
  // Remove item
  const removeItem = (category, id) => {
    const filterFn = (items) => items.filter(item => item.id !== id);
    switch(category) {
      case 'food': setFood(filterFn(food)); break;
      case 'drinks': setDrinks(filterFn(drinks)); break;
      case 'dessert': setDessert(filterFn(dessert)); break;
      case 'other': setOther(filterFn(other)); break;
    }
  };
  
  // Calculate totals
  const calculateCategoryTotal = (items) => {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  };
  
  const foodTotal = calculateCategoryTotal(food);
  const drinksTotal = calculateCategoryTotal(drinks);
  const dessertTotal = calculateCategoryTotal(dessert);
  const otherTotal = calculateCategoryTotal(other);
  const orderTotal = foodTotal + drinksTotal + dessertTotal + otherTotal;
  const paid = Number(amountPaid) || 0;
  const gratuity = paid - orderTotal;
  
  // Clear all
  const clearDocket = () => {
    setFood([]);
    setDrinks([]);
    setDessert([]);
    setOther([]);
    setAmountPaid("");
  };
  
  // Save order (placeholder for future integration)
  const saveDocket = async () => {
    const docket = {
      food, drinks, dessert, other,
      orderTotal, amountPaid: paid, gratuity,
      timestamp: new Date().toISOString()
    };
    // Persist as a sale for dashboard/graphs; include line items for analytics
    const items = [...food, ...drinks, ...dessert, ...other]
      .filter(i => i?.name)
      .map(i => ({ 
        name: i.name, 
        price: Number(i.price) || 0,
        quantity: 1,
      }));
    await addSale({ date: docket.timestamp, amount: orderTotal, cost: 0, items });
    
    // Log order creation to audit log
    try {
      await logOrderCreated({
        items: [...food, ...drinks, ...dessert, ...other].map(i => ({ 
          name: i.name, 
          price: Number(i.price) || 0 
        })),
        total: orderTotal,
        gratuity,
        amountPaid: paid,
      });
    } catch (e) {
      console.error("Failed to log order creation:", e);
    }
    
    console.log("Order saved:", docket);
    alert("Order saved and added to dashboard analytics.");
    // Optional: clear after save
    clearDocket();
  };

  // Get category icon and color
  const getCategoryStyle = (category) => {
    const styles = {
      food: { color: '#ff6b6b', bgColor: 'rgba(255, 107, 107, 0.08)', icon: '🍽️' },
      drinks: { color: '#4dabf7', bgColor: 'rgba(77, 171, 247, 0.08)', icon: '🥤' },
      dessert: { color: '#ff8787', bgColor: 'rgba(255, 135, 135, 0.08)', icon: '🍰' },
      other: { color: '#748ffc', bgColor: 'rgba(116, 143, 252, 0.08)', icon: '📦' },
    };
    return styles[category] || styles.other;
  };

  // Render category section
  const renderCategory = (title, items, category) => {
    const style = getCategoryStyle(category);
    const subtotal = calculateCategoryTotal(items);
    
    return (
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          border: '2px solid',
          borderColor: items.length > 0 ? style.color + '40' : 'rgba(226, 232, 240, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          '&:hover': {
            boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: style.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: `0 2px 8px ${style.color}15`,
              }}
            >
              {style.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.3px' }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          
          <HintTooltip title={`Add a new ${title.toLowerCase()} item to this order. Enter the item name and price.`}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Plus size={18} />}
              onClick={() => addItem(category)}
              sx={{
                mb: 2.5,
                py: 1.25,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                bgcolor: style.color,
                color: 'white',
                boxShadow: `0 2px 8px ${style.color}30`,
                '&:hover': {
                  bgcolor: style.color,
                  filter: 'brightness(0.92)',
                  boxShadow: `0 4px 12px ${style.color}50`,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Add Item
            </Button>
          </HintTooltip>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: '100px' }}>
            {items.length === 0 && (
              <Box 
                sx={{ 
                  py: 4, 
                  textAlign: 'center',
                  borderRadius: '10px',
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  border: '2px dashed',
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
                  No items added
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click "Add" to start
                </Typography>
              </Box>
            )}
            {items.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  p: 1.75,
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  bgcolor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.015)' : 'white',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: style.color + '50',
                    bgcolor: style.bgColor,
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: '8px',
                    bgcolor: style.bgColor,
                    color: style.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {index + 1}
                </Box>
                <TextField
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(category, item.id, 'name', e.target.value)}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: 'white',
                      fontSize: '0.9rem',
                      '&:hover': {
                        bgcolor: 'white',
                      },
                    },
                  }}
                />
                <TextField
                  placeholder="0.00"
                  value={item.price}
                  onChange={(e) => updateItem(category, item.id, 'price', e.target.value)}
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  size="small"
                  sx={{
                    width: '130px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    },
                  }}
                  InputProps={{
                    startAdornment: <Typography variant="body2" fontWeight={700} sx={{ mr: 0.5, color: style.color, fontSize: '0.9rem' }}>R</Typography>
                  }}
                />
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => removeItem(category, item.id)}
                  sx={{
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: 'rgba(211, 47, 47, 0.2)',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: 'rgba(211, 47, 47, 0.08)',
                      borderColor: 'rgba(211, 47, 47, 0.4)',
                    },
                  }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </Box>
            ))}
            
            {items.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                  pt: 2.5,
                  px: 2.5,
                  pb: 1,
                  borderTop: '2px solid',
                  borderColor: style.color + '25',
                  bgcolor: style.bgColor,
                  borderRadius: '10px',
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: style.color }}>
                  Subtotal
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: style.color }}>
                  {currency(subtotal)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <SectionTitle 
        icon={Receipt} 
        title="Manual Order Entry"
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <HintTooltip title="Clear all items and reset the order to start fresh">
              <Button
                variant="outlined"
                onClick={clearDocket}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                }}
              >
                Clear All
              </Button>
            </HintTooltip>
            <HintTooltip title="Save this order and add it to sales records. The order will appear in today's orders count and financial reports">
              <Button
                variant="contained"
                startIcon={<Save size={16} />}
                onClick={saveDocket}
                disabled={orderTotal === 0}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  boxShadow: '0 2px 8px rgba(139, 0, 0, 0.2)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(139, 0, 0, 0.3)',
                  },
                }}
              >
                Save Order
              </Button>
            </HintTooltip>
          </Box>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderCategory('Food', food, 'food')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderCategory('Drinks', drinks, 'drinks')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderCategory('Dessert', dessert, 'dessert')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderCategory('Other', other, 'other')}
        </Grid>
      </Grid>

      {/* Order Summary */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          border: '2px solid',
          borderColor: orderTotal > 0 ? 'rgba(139, 0, 0, 0.2)' : 'rgba(226, 232, 240, 0.8)',
        }}
      >
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: 'rgba(139, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              🧾
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                Order Summary
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Complete payment calculation
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Category breakdowns */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                bgcolor: 'white',
                border: '1.5px solid',
                borderColor: 'rgba(0, 0, 0, 0.08)',
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: 'block', letterSpacing: '0.5px' }}>
                CATEGORY BREAKDOWN
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '16px' }}>🍽️</Typography>
                    <Typography variant="body2" fontWeight={500}>Food</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#ff6b6b' }}>
                    {currency(foodTotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '16px' }}>🥤</Typography>
                    <Typography variant="body2" fontWeight={500}>Drinks</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#4dabf7' }}>
                    {currency(drinksTotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '16px' }}>🍰</Typography>
                    <Typography variant="body2" fontWeight={500}>Dessert</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#ff8787' }}>
                    {currency(dessertTotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '16px' }}>📦</Typography>
                    <Typography variant="body2" fontWeight={500}>Other</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#748ffc' }}>
                    {currency(otherTotal)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Order Total */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                bgcolor: 'rgba(139, 0, 0, 0.06)',
                border: '2px solid',
                borderColor: 'rgba(139, 0, 0, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#8b0000' }}>
                  ORDER TOTAL
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#8b0000' }}>
                  {currency(orderTotal)}
                </Typography>
              </Box>
            </Box>
            
            {/* Amount Paid */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                bgcolor: 'white',
                border: '1.5px solid',
                borderColor: 'rgba(0, 0, 0, 0.08)',
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: 'block', letterSpacing: '0.5px' }}>
                PAYMENT RECEIVED
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ minWidth: '110px' }}>
                  Amount Paid
                </Typography>
                <TextField
                  placeholder="Enter amount"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <Typography 
                        variant="subtitle1" 
                        sx={{ mr: 0.75, fontWeight: 700, color: '#8b0000' }}
                      >
                        R
                      </Typography>
                    )
                  }}
                />
              </Box>
            </Box>
            
            {/* Gratuity */}
            <Box
              sx={{
                p: 3,
                borderRadius: '12px',
                background: gratuity >= 0 
                  ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(244, 67, 54, 0.04) 100%)',
                border: '2px solid',
                borderColor: gratuity >= 0 ? 'rgba(76, 175, 80, 0.25)' : 'rgba(244, 67, 54, 0.25)',
                boxShadow: gratuity >= 0 
                  ? '0 2px 12px rgba(76, 175, 80, 0.1)'
                  : '0 2px 12px rgba(244, 67, 54, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography 
                    variant="overline" 
                    fontWeight={700} 
                    sx={{ 
                      color: gratuity >= 0 ? 'success.main' : 'error.main',
                      letterSpacing: '0.8px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {gratuity >= 0 ? '✓ GRATUITY' : '⚠ SHORTFALL'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mt: 0.5, display: 'block' }}>
                    {gratuity >= 0 
                      ? 'Customer tip amount'
                      : 'Payment insufficient'
                    }
                  </Typography>
                </Box>
                <Typography 
                  variant="h4" 
                  fontWeight={700}
                  sx={{ 
                    color: gratuity >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {currency(Math.abs(gratuity))}
                </Typography>
              </Box>
              
              {gratuity < 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: '8px',
                    bgcolor: 'rgba(244, 67, 54, 0.08)',
                    border: '1px solid rgba(244, 67, 54, 0.15)',
                  }}
                >
                  <Typography variant="caption" color="error" fontWeight={600} sx={{ textAlign: 'center', display: 'block' }}>
                    ⚠️ Customer has underpaid by {currency(Math.abs(gratuity))}
                  </Typography>
                </Box>
              )}
              
              {gratuity > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: '8px',
                    bgcolor: 'rgba(76, 175, 80, 0.08)',
                    border: '1px solid rgba(76, 175, 80, 0.15)',
                  }}
                >
                  <Typography variant="caption" color="success.main" fontWeight={600} sx={{ textAlign: 'center', display: 'block' }}>
                    🎉 Thank you! Gratuity is {((gratuity / orderTotal) * 100).toFixed(1)}% of order total
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ScannerPage;
