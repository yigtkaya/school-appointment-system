import type { LoginRequest, RegisterRequest, TokenResponse, User } from "@/api/types"
import { apiClient } from "./client"


export const authAPI = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/auth/login', credentials)
    
    // Store token in client
    apiClient.setToken(response.access_token)
    
    return response
  },

  async register(userData: RegisterRequest): Promise<User> {
    return apiClient.post<User>('/api/auth/register', userData)
  },

  async me(): Promise<User> {
    return apiClient.get<User>('/api/auth/me')
  },

  logout(): void {
    apiClient.clearToken()
    window.dispatchEvent(new CustomEvent('auth:logout'))
  },

  async refreshToken(): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/auth/refresh')
    apiClient.setToken(response.access_token)
    return response
  }
}