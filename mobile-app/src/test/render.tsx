// src/test/render.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../theme'; // named import

// console.log removed
import { store } from '../store';

/**
 * Helper to render a component with Redux, Navigation, and Theme context.
 * Returns the render result from @testing-library/react-native so tests can
 * use query utilities like getByText, getByTestId, etc.
 */
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <Provider store={store}>
      <ThemeProvider>{ui}</ThemeProvider>
    </Provider>
  );
}
