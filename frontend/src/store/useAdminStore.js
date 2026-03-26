import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAdminStore = create((set, get) => ({
  // State
  businesses: [],
  coupons: [],
  challenges: [],
  promos: [],
  stats: { totalCoupons: 0, redeemedCoupons: 0, totalPartners: 0, totalChallenges: 0 },
  chartData: [],
  recentActivity: [],
  loading: {
    businesses: false,
    coupons: false,
    challenges: false,
    promos: false,
    stats: false,
    global: false
  },

  // Actions
  fetchBusinesses: async () => {
    set((state) => ({ loading: { ...state.loading, businesses: true } }));
    try {
      const res = await axios.get(`${API_BASE}/partners`);
      set({ businesses: res.data });
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      set((state) => ({ loading: { ...state.loading, businesses: false } }));
    }
  },

  fetchCoupons: async () => {
    set((state) => ({ loading: { ...state.loading, coupons: true } }));
    try {
      // In this app, "coupons" usually refers to Promos (templates) in the admin dashboard
      const res = await axios.get(`${API_BASE}/promos`);
      set({ promos: res.data, coupons: res.data }); 
    } catch (err) {
      console.error('Error fetching promos:', err);
    } finally {
      set((state) => ({ loading: { ...state.loading, coupons: false } }));
    }
  },

  fetchChallenges: async () => {
    set((state) => ({ loading: { ...state.loading, challenges: true } }));
    try {
      const res = await axios.get(`${API_BASE}/challenges`);
      set({ challenges: res.data });
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      set((state) => ({ loading: { ...state.loading, challenges: false } }));
    }
  },

  fetchStats: async () => {
    set((state) => ({ loading: { ...state.loading, stats: true } }));
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      set({ 
        stats: res.data, 
        chartData: res.data.chartData || [], 
        recentActivity: res.data.recentActivity || [] 
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      set((state) => ({ loading: { ...state.loading, stats: false } }));
    }
  },

  fetchAllData: async () => {
    set((state) => ({ loading: { ...state.loading, global: true } }));
    await Promise.all([
      get().fetchBusinesses(),
      get().fetchCoupons(),
      get().fetchChallenges(),
      get().fetchStats(),
    ]);
    set((state) => ({ loading: { ...state.loading, global: false } }));
  }
}));
