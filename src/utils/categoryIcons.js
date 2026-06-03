// Map icon names to Lucide icon names for dynamic rendering
export const CATEGORY_ICONS = {
  // Income
  salary: 'Briefcase',
  freelance: 'Laptop',
  investment: 'TrendingUp',
  gift: 'Gift',
  bonus: 'Star',
  // Expense - Food
  food: 'UtensilsCrossed',
  coffee: 'Coffee',
  restaurant: 'ChefHat',
  // Expense - Transport
  transport: 'Car',
  fuel: 'Fuel',
  taxi: 'MapPin',
  // Expense - Shopping
  shopping: 'ShoppingBag',
  clothes: 'Shirt',
  electronics: 'Smartphone',
  // Expense - Bills
  bills: 'Receipt',
  electricity: 'Zap',
  water: 'Droplets',
  internet: 'Wifi',
  phone: 'Phone',
  // Expense - Health
  health: 'Heart',
  medicine: 'Pill',
  gym: 'Dumbbell',
  // Expense - Entertainment
  entertainment: 'Gamepad2',
  movie: 'Clapperboard',
  music: 'Music',
  // Expense - Education
  education: 'BookOpen',
  course: 'GraduationCap',
  // Other
  home: 'Home',
  pet: 'PawPrint',
  travel: 'Plane',
  savings: 'Vault',
  other: 'MoreHorizontal',
}

export const ICON_LIST = Object.entries(CATEGORY_ICONS).map(([key, icon]) => ({ key, icon }))

export const DEFAULT_CATEGORY_COLORS = [
  '#34D399', '#FB7185', '#60A5FA', '#FBBF24', '#A78BFA',
  '#F472B6', '#34D399', '#2DD4BF', '#FB923C', '#818CF8',
]
