// iOS Glassmorphism Color Palette
export const GlassColors = {
  background: {
    gradient1: '#667eea', // Purple
    gradient2: '#764ba2', // Deep purple
    gradient3: '#f093fb', // Pink
    gradient4: '#4facfe', // Blue
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.2)',
    medium: 'rgba(255, 255, 255, 0.15)',
    dark: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.3)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.6)',
  },
  accent: {
    blue: '#4facfe',
    purple: '#764ba2',
    pink: '#f093fb',
    green: '#4caf50',
    red: '#f44336',
  },
  status: {
    online: 'rgba(76, 175, 80, 0.3)',
    offline: 'rgba(244, 67, 54, 0.3)',
  },
};

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
