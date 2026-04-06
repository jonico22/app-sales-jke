export const getRoleBadgeColor = (fullRoleCode: string) => {
  const roleCode = fullRoleCode.split('-')[0]; // Extract base role (e.g., SELLER from SELLER-SOC-...)
  switch (roleCode) {
    case 'OWNER':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'BUSINESS_MANAGER':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'SELLER':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  }
};
