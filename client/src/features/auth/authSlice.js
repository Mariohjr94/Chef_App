import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../app/api';
import { useSelector } from "react-redux"; 

const TOKEN = "token";

// Inject auth endpoints into the API
const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query({
      query: () => '/auth/me',
      providesTags: ['Me'], // Provides the `Me` tag so it's cached properly
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Invalidate the 'me' query so the user info is refreshed after login
      invalidatesTags: ['Me'],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;  // this will contain token or login response
          // Dispatch the token to Redux and localStorage
          dispatch(storeToken({ token: data.token }));
        } catch (err) {
          console.log('Login failed:', err);
        }
      }
    }),
  
    
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Me'], // Invalidate to refetch `me` after registration
    }),
    logout: builder.mutation({
      queryFn: () => ({ data: {} }),
      invalidatesTags: ['Me'], // Invalidate to clear `me` data on logout
    }),
  }),
});

// Define auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem(TOKEN) || null,
    user: null,
  },
  reducers: {
    storeToken(state, action) {
      state.token = action.payload.token;
      window.localStorage.setItem(TOKEN, action.payload.token);
    },
    clearToken(state) {
      state.token = null;
      window.localStorage.removeItem(TOKEN);
    },
  },
  extraReducers: (builder) => {
    // Listen to 'me' query and store user data after login
    builder.addMatcher(
      authApi.endpoints.me.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;  // Store the user info in state
      }
    );
    // Clear user info on logout
  builder.addMatcher(
    authApi.endpoints.logout.matchFulfilled,
    (state) => {
      state.user = null;
      state.token = null;  
      window.localStorage.removeItem(TOKEN);  
      }
    );
  }
});

// Export RTK Query hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useLogoutMutation
} = authApi;

// Redux actions
export const { storeToken, clearToken } = authSlice.actions;

// Export the reducer to integrate into the store
export default authSlice.reducer;
