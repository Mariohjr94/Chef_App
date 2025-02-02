// src/app/api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create a base API instance with token handling
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL, 
    prepareHeaders: (headers) => {
     
      const token = localStorage.getItem('token'); 
      if (token) {
        headers.set('Authorization', `Bearer ${token}`); 
      }
      return headers;
    },
  }),
  tagTypes: ['Me'],
  endpoints: () => ({}),  
});
