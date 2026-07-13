import type { ServiceType } from '../services/authService';

export function getDashboardPath(serviceType?: ServiceType | string) {
  switch (serviceType) {
    case 'DIY':
      return '/diy-dashboard';
    case 'PROFESSIONAL':
      return '/professional-dashboard';
    default:
      return '/preserve-story';
  }
}
