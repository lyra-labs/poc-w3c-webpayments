const initialState = {
  total: 0,
  items: [],
};

const cart = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        total: state.total + action.item.price,
        items: [
          ...state.items,
          action.item,
        ],
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

export default cart;
