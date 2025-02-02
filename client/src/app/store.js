// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
// import { authApi } from '../features/auth/authSlice';  
import authReducer from '../features/auth/authSlice';  
import {api} from "./api"



 const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,  // API slice
    auth: authReducer,  // Authentication slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),  // Add RTK Query middleware
});

export default store;