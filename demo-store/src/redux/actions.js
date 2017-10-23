export const addToCart = item => ({
  type: 'ADD_TO_CART',
  item,
});

export const clearCart = () => ({
  type: 'CLEAR_CART',
});
