// Modern Design System for Workout Planner with OKLCH Colors
export const designSystem = {
  // OKLCH Color System - Perceptually uniform and future-proof
  colors: {
    // Primary colors using OKLCH
    primary: {
      50: 'oklch(0.971 0.013 264)',  // Very light blue
      100: 'oklch(0.929 0.029 264)', // Light blue  
      200: 'oklch(0.885 0.058 264)', // Lighter blue
      300: 'oklch(0.838 0.087 264)', // Light-medium blue
      400: 'oklch(0.789 0.116 264)', // Medium blue
      500: 'oklch(0.639 0.174 264)', // Base blue
      600: 'oklch(0.589 0.174 264)', // Darker blue
      700: 'oklch(0.539 0.154 264)', // Dark blue
      800: 'oklch(0.439 0.134 264)', // Very dark blue
      900: 'oklch(0.339 0.114 264)', // Deepest blue
    },
    
    // Workout type colors with consistent lightness and chroma
    workoutTypes: {
      strength: {
        primary: 'oklch(0.639 0.174 264)',     // Blue - consistent with primary
        secondary: 'oklch(0.929 0.029 264)',   // Light blue
        icon: 'oklch(0.539 0.154 264)',        // Darker blue
        gradient: 'linear-gradient(135deg, oklch(0.639 0.174 264), oklch(0.589 0.174 264))'
      },
      cardio: {
        primary: 'oklch(0.639 0.174 15)',      // Red - same lightness/chroma, different hue
        secondary: 'oklch(0.929 0.029 15)',    // Light red
        icon: 'oklch(0.539 0.154 15)',         // Darker red  
        gradient: 'linear-gradient(135deg, oklch(0.639 0.174 15), oklch(0.589 0.174 15))'
      },
      flexibility: {
        primary: 'oklch(0.639 0.174 160)',     // Green - same lightness/chroma, different hue
        secondary: 'oklch(0.929 0.029 160)',   // Light green
        icon: 'oklch(0.539 0.154 160)',        // Darker green
        gradient: 'linear-gradient(135deg, oklch(0.639 0.174 160), oklch(0.589 0.174 160))'
      },
      rest: {
        primary: 'oklch(0.639 0.174 85)',      // Orange - same lightness/chroma, different hue
        secondary: 'oklch(0.929 0.029 85)',    // Light orange
        icon: 'oklch(0.539 0.154 85)',         // Darker orange
        gradient: 'linear-gradient(135deg, oklch(0.639 0.174 85), oklch(0.589 0.174 85))'
      },
      mixed: {
        primary: 'oklch(0.639 0.174 305)',     // Purple - same lightness/chroma, different hue
        secondary: 'oklch(0.929 0.029 305)',   // Light purple
        icon: 'oklch(0.539 0.154 305)',        // Darker purple
        gradient: 'linear-gradient(135deg, oklch(0.639 0.174 305), oklch(0.589 0.174 305))'
      }
    },

    // Semantic colors with OKLCH
    semantic: {
      success: 'oklch(0.639 0.174 160)',      // Green
      successLight: 'oklch(0.929 0.029 160)', // Light green
      warning: 'oklch(0.639 0.174 85)',       // Orange
      warningLight: 'oklch(0.929 0.029 85)',  // Light orange
      error: 'oklch(0.639 0.174 15)',         // Red
      errorLight: 'oklch(0.929 0.029 15)',    // Light red
      info: 'oklch(0.639 0.174 264)',         // Blue
      infoLight: 'oklch(0.929 0.029 264)'     // Light blue
    },

    // Neutral grays with OKLCH for consistent perception
    neutral: {
      0: 'oklch(1 0 0)',        // Pure white
      50: 'oklch(0.985 0 0)',   // Very light gray
      100: 'oklch(0.97 0 0)',   // Light gray
      200: 'oklch(0.93 0 0)',   // Lighter gray
      300: 'oklch(0.86 0 0)',   // Light-medium gray
      400: 'oklch(0.71 0 0)',   // Medium gray
      500: 'oklch(0.56 0 0)',   // Medium-dark gray
      600: 'oklch(0.45 0 0)',   // Dark gray
      700: 'oklch(0.34 0 0)',   // Darker gray
      800: 'oklch(0.23 0 0)',   // Very dark gray
      900: 'oklch(0.15 0 0)'    // Nearly black
    },

    // Glass morphism with OKLCH alpha support
    glass: {
      light: 'oklch(1 0 0 / 0.9)',      // Semi-transparent white
      medium: 'oklch(1 0 0 / 0.7)',     // More transparent white
      dark: 'oklch(1 0 0 / 0.1)',       // Very transparent white
      backdrop: 'oklch(0 0 0 / 0.5)'    // Semi-transparent black
    }
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', '1rem'],     // 12px
      sm: ['0.875rem', '1.25rem'], // 14px
      base: ['1rem', '1.5rem'],    // 16px
      lg: ['1.125rem', '1.75rem'], // 18px
      xl: ['1.25rem', '1.875rem'], // 20px
      '2xl': ['1.5rem', '2rem'],   // 24px
      '3xl': ['1.875rem', '2.25rem'], // 30px
      '4xl': ['2.25rem', '2.5rem'],   // 36px
      '5xl': ['3rem', '1']            // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    }
  },

  // Spacing System
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    base: '1rem',    // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  },

  // Shadow System
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none'
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Helper functions for design system
export const getWorkoutTypeStyle = (type) => {
  const workoutType = designSystem.colors.workoutTypes[type] || designSystem.colors.workoutTypes.mixed;
  return workoutType;
};

export const getWorkoutTypeIcon = (type) => {
  const icons = {
    strength: 'Dumbbell',
    cardio: 'Heart',
    flexibility: 'Wind',
    rest: 'Coffee',
    mixed: 'Zap'
  };
  return icons[type] || icons.mixed;
};

// CSS-in-JS helper for Tailwind classes
export const tw = {
  // Card styles
  card: {
    base: 'bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden',
    hover: 'hover:shadow-lg transition-all duration-300 cursor-pointer',
    glass: 'backdrop-blur-lg bg-white/90 border border-white/20'
  },
  
  // Button styles
  button: {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg transition-all duration-200',
    fab: 'fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50'
  },
  
  // Input styles
  input: {
    base: 'w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
  },
  
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12'
};

export default designSystem;