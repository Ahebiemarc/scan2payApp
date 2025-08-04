// Description: Service pour gérer l'authentification.
// ============================================================
import api from './api';
import { RegisterUserDto, LoginUserDto, AuthResponseDto, UpdateUserProfileDto, ChangePasswordDto, UserProfile } from '../types/dto';

export const authService = {
  register: (registerData: RegisterUserDto) => {
    console.log(registerData);
    
    return api.post<AuthResponseDto>('/accounts/register', registerData);

  },
  login: (loginData: LoginUserDto) => {
        console.log("loginData: ", loginData);

    return api.post<AuthResponseDto>('/accounts/login', loginData);
  },
  getProfile: () => {
    return api.get<UserProfile>('/accounts/profile');
  },
  updateProfile: (profileData: UpdateUserProfileDto) => {
    return api.put('/accounts/profile', profileData);
  },
  changePassword: (passwordData: ChangePasswordDto) => {
    return api.post('/accounts/change-password', passwordData);
  }
};