import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import App from './src/App';

export default function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
