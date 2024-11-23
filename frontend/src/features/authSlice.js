import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api/auth';

// Async thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, { email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const signin = createAsyncThunk(
  'auth/signin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signin`, { email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-email`, { email, otp });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/request-otp`, { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isLoggedIn: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isLoggedIn = false; // User must verify email first
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Signin
      .addCase(signin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(signin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.status = 'succeeded';
        if (state.user) {
          state.user.isVerified = true;
        }
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null; // Reset error on success
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { logout } = authSlice.actions;
export default authSlice.reducer;
