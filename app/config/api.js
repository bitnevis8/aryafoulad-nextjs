// بررسی محیط اجرا
const isDevelopment = process.env.NODE_ENV === 'development';
console.log('Current environment:', process.env.NODE_ENV); // برای دیباگ

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aryafoulad-api.pourdian.com';

export const API_ENDPOINTS = {
  unitLocations: {
    base: `${API_BASE_URL}/aryafoulad/unit-locations`,
    getAll: `${API_BASE_URL}/aryafoulad/unit-locations`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/${id}`,
    create: `${API_BASE_URL}/aryafoulad/unit-locations/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/unit-locations/delete/${id}`,
    default: `${API_BASE_URL}/aryafoulad/unit-locations/default`,
  },
  users: {
    base: `${API_BASE_URL}/user/user`,
    getAll: `${API_BASE_URL}/user/user/getAll`,
    getById: (id) => `${API_BASE_URL}/user/user/getOne/${id}`,
    create: `${API_BASE_URL}/user/user/create`,
    update: (id) => `${API_BASE_URL}/user/user/update/${id}`,
    delete: (id) => `${API_BASE_URL}/user/user/delete/${id}`,
    search: `${API_BASE_URL}/user/user/search`,
  },
  roles: {
    base: `${API_BASE_URL}/user/role`,
    getAll: `${API_BASE_URL}/user/role/getAll`,
    getById: (id) => `${API_BASE_URL}/user/role/getOne/${id}`,
    create: `${API_BASE_URL}/user/role/create`,
    update: (id) => `${API_BASE_URL}/user/role/update/${id}`,
    delete: (id) => `${API_BASE_URL}/user/role/delete/${id}`,
  },
  missionOrders: {
    base: `${API_BASE_URL}/aryafoulad/mission-orders`,
    getAll: `${API_BASE_URL}/aryafoulad/mission-orders/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/mission-orders/getOne/${id}`,
    create: `${API_BASE_URL}/aryafoulad/mission-orders/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/mission-orders/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/mission-orders/delete/${id}`,
  },
  rateSettings: {
    base: `${API_BASE_URL}/aryafoulad/rate-settings`,
    getAll: `${API_BASE_URL}/aryafoulad/rate-settings/getAll`,
    getActive: `${API_BASE_URL}/aryafoulad/rate-settings/getActive`,
    getRateByDate: (missionDate) => `${API_BASE_URL}/aryafoulad/rate-settings/getRateByDate?missionDate=${missionDate}`,
    create: `${API_BASE_URL}/aryafoulad/rate-settings/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/rate-settings/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/rate-settings/delete/${id}`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/rate-settings/${id}`,
  },
  // مدیریت تجهیزات
  warehouse: {
    base: `${API_BASE_URL}/aryafoulad/equipment-module/warehouse`,
    getAll: `${API_BASE_URL}/aryafoulad/equipment-module/warehouse/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/warehouse/getOne/${id}`,
    create: `${API_BASE_URL}/aryafoulad/equipment-module/warehouse/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/warehouse/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/warehouse/delete/${id}`,
    search: (query) => `${API_BASE_URL}/aryafoulad/equipment-module/warehouse/search?query=${query}`,
  },
  equipment: {
    base: `${API_BASE_URL}/aryafoulad/equipment-module/equipment`,
    getAll: `${API_BASE_URL}/aryafoulad/equipment-module/equipment/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment/getOne/${id}`,
    create: `${API_BASE_URL}/aryafoulad/equipment-module/equipment/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment/delete/${id}`,
    search: (query) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment/search?query=${query}`,
  },
  equipmentAssignments: {
    base: `${API_BASE_URL}/aryafoulad/equipment-module/equipment-assignment`,
    getAll: `${API_BASE_URL}/aryafoulad/equipment-module/equipment-assignment/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment-assignment/getOne/${id}`,
    getByEquipment: (equipmentId) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment-assignment/getByEquipment/${equipmentId}`,
    create: `${API_BASE_URL}/aryafoulad/equipment-module/equipment-assignment/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment-assignment/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment-assignment/delete/${id}`,
    return: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/equipment-assignment/return/${id}`,
  },
  calibrationHistory: {
    base: `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history`,
    getAll: `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/getAll`,
    getById: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/getOne/${id}`,
    getByEquipment: (equipmentId) => `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/getByEquipment/${equipmentId}`,
    create: `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/create`,
    update: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/update/${id}`,
    delete: (id) => `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/delete/${id}`,
    // گزارش‌های کالیبراسیون
    report: `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/report`,
    expired: `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/expired`,
    nearExpiry: (days = 30) => `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/near-expiry?days=${days}`,
    recent: (days = 30) => `${API_BASE_URL}/aryafoulad/equipment-module/calibration-history/recent?days=${days}`,
  },

  auth: {
    registerEmail: `${API_BASE_URL}/user/auth/register/email`,
    login: `${API_BASE_URL}/user/auth/login`,
    verifyEmail: `${API_BASE_URL}/user/auth/verify/email`,
    resendEmailCode: `${API_BASE_URL}/user/auth/resend-code/email`,
    me: `${API_BASE_URL}/user/auth/me`,
    logout: `${API_BASE_URL}/user/auth/logout`,
  },
  leaveRequest: {
    base: `${API_BASE_URL}/leave-request`,
    create: `${API_BASE_URL}/leave-request/create`,
    my: `${API_BASE_URL}/leave-request/my`,
    all: `${API_BASE_URL}/leave-request/all`,
    types: `${API_BASE_URL}/leave-request/types`,
    approve: (id) => `${API_BASE_URL}/leave-request/approve/${id}`,
    report: `${API_BASE_URL}/leave-request/report`,
  },
}; 