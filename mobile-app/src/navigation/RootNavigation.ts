import * as React from 'react';

// Navigation reference used for navigation actions outside of React components (e.g., notification handler)
export const navigationRef = React.createRef<any>();

export function navigate(name: string, params?: any) {
  navigationRef.current?.navigate(name, params);
}
