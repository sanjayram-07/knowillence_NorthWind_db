import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  salesOverview: null,
  loading: {
    sales: false,
    customers: false,
    ai: false
  }
};

const actionTypes = {
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SALES_OVERVIEW: 'SET_SALES_OVERVIEW',
  SET_LOADING: 'SET_LOADING',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };
    
    case actionTypes.SET_SALES_OVERVIEW:
      return { ...state, salesOverview: action.payload };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
    
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleSidebar = () => dispatch({ type: actionTypes.TOGGLE_SIDEBAR });
  
  const setSalesOverview = (data) => 
    dispatch({ type: actionTypes.SET_SALES_OVERVIEW, payload: data });
  
  const setLoading = (key, value) => 
    dispatch({ type: actionTypes.SET_LOADING, payload: { key, value } });
  
  const addNotification = (notification) => 
    dispatch({ 
      type: actionTypes.ADD_NOTIFICATION, 
      payload: { ...notification, id: Date.now() } 
    });
  
  const removeNotification = (id) => 
    dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: id });

  const value = {
    ...state,
    toggleSidebar,
    setSalesOverview,
    setLoading,
    addNotification,
    removeNotification
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
