import { apiClient } from './client'
import type { 
  LoginRequest, 
  TokenResponse, 
  UserCreate, 
  User 
} from '@/types/api'

export const authAPI = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', credentials)
    
    // Store token in client
    apiClient.setToken(response.access_token)
    
    return response
  },

  async register(userData: UserCreate): Promise<User> {
    return apiClient.post<User>('/auth/register', userData)
  },

  async me(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  },

  logout(): void {
    apiClient.clearToken()
    window.dispatchEvent(new CustomEvent('auth:logout'))
  },

  async refreshToken(): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/refresh')
    apiClient.setToken(response.access_token)
    return response
  }
}