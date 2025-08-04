const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};


// Description: Central place for color definitions.
// ============================================================
export const COLORS = {
  primary: '#03A9F4', // Main Green Accent
  primaryDark: '#388E3C',
  primaryLight: '#C8E6C9',
  secondary: '#03A9F4', // Accent Blue (example)
  white: '#FFFFFF',
  black: '#333333', // Dark text
  grey: '#CCCCCC', // Borders, inactive elements
  lightGrey: '#F5F5F5', // Input backgrounds, separators
  darkGrey: '#A9A9A9', // Placeholder text, secondary info
  background: '#E8F5E9', // Light green background for screens
  error: '#F44336', // Red for errors or sent transactions
  warning: '#FFA000', // Orange for warnings or withdrawals
  success: '#4CAF50', // Green for success or received transactions
  info: '#007AFF',          // <- AJOUTEZ CETTE LIGNE, vous pouvez choisir votre propre bleu ou cyan

};
