// src/__tests__/integration/ResidentCrud.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../test/render';
import { mockResident } from '../../test/fixtures/resident';
import ResidentListScreen from '../../screens/residents/ResidentListScreen';
import ResidentFormScreen from '../../screens/residents/ResidentFormScreen';
import ResidentDetailScreen from '../../screens/residents/ResidentDetailScreen';
import * as residentApi from '../../store/residentApi';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Simple in‑memory mock store for residents
const residents: Record<string, typeof mockResident> = {};

// Helper to reset mock store before each test
const resetStore = () => {
  Object.keys(residents).forEach((k) => delete residents[k]);
};

// Mock the RTK Query hooks used across screens
jest.mock('../../store/residentApi', () => {
  const actual = jest.requireActual('../../store/residentApi');
  return {
    ...actual,
    // List query
    useGetResidentsQuery: jest.fn(),
    // Detail query
    useGetResidentByIdQuery: jest.fn(),
    // Mutations
    useCreateResidentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
    useUpdateResidentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
    useDeleteResidentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  };
});

const mockUseGetResidentsQuery = residentApi.useGetResidentsQuery as jest.Mock;
const mockUseGetResidentByIdQuery = residentApi.useGetResidentByIdQuery as jest.Mock;
const mockCreateMutation = residentApi.useCreateResidentMutation as jest.Mock;
const mockUpdateMutation = residentApi.useUpdateResidentMutation as jest.Mock;
const mockDeleteMutation = residentApi.useDeleteResidentMutation as jest.Mock;

// Setup mock implementations
beforeEach(() => {
  resetStore();
  // List returns current residents array
  mockUseGetResidentsQuery.mockImplementation(() => ({
    data: Object.values(residents),
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }));

  // Detail returns a single resident based on param
  mockUseGetResidentByIdQuery.mockImplementation((_args: any, { selectFromResult }: any) => {
    // RTK Query may call with id argument; simplify to return from store
    const id = _args?.id ?? mockResident.id; // fallback
    return {
      data: residents[id] as any,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    };
  });

  // Create mutation pushes to store
  mockCreateMutation.mockImplementation(() => {
    const fn = jest.fn().mockImplementation(async (payload: any) => {
      const id = String(Date.now());
      residents[id] = { ...payload, id };
      return { data: residents[id] };
    });
    return [fn, { isLoading: false }];
  });

  // Update mutation modifies existing entry
  mockUpdateMutation.mockImplementation(() => {
    const fn = jest.fn().mockImplementation(async (payload: any) => {
      const { id, ...rest } = payload;
      residents[id] = { ...residents[id], ...rest } as any;
      return { data: residents[id] };
    });
    return [fn, { isLoading: false }];
  });

  // Delete mutation removes entry
  mockDeleteMutation.mockImplementation(() => {
    const fn = jest.fn().mockImplementation(async (id: string) => {
      delete residents[id];
      return { data: {} };
    });
    return [fn, { isLoading: false }];
  });
});

// Minimal navigation stack for the flow
const Stack = createNativeStackNavigator();
const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="List">
      <Stack.Screen name="List" component={ResidentListScreen} />
      <Stack.Screen name="Detail" component={ResidentDetailScreen} />
      <Stack.Screen name="Form" component={ResidentFormScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Resident CRUD integration flow', () => {
  it('adds, edits, and deletes a resident', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithProviders(<TestNavigator />);

    // ---- CREATE ----
    // Navigate to Form via FAB (assume button text "Add Resident")
    fireEvent.press(getByText(/add resident/i));
    // Fill form fields
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Phone'), '+1234567890');
    fireEvent.press(getByText(/save/i));
    await waitFor(() => expect(mockCreateMutation()[0]).toHaveBeenCalled());

    // ---- LIST REFRESH ----
    // After creation, list should show the new resident
    await waitFor(() => expect(getByText('John Doe')).toBeTruthy());

    // ---- DETAIL ----
    fireEvent.press(getByText('John Doe'));
    await waitFor(() => expect(getByText('+1234567890')).toBeTruthy());

    // ---- EDIT ----
    fireEvent.press(getByText(/edit/i)); // assume an Edit button
    fireEvent.changeText(getByPlaceholderText('Phone'), '+1987654321');
    fireEvent.press(getByText(/save/i));
    await waitFor(() => expect(mockUpdateMutation()[0]).toHaveBeenCalled());
    await waitFor(() => expect(getByText('+1987654321')).toBeTruthy());

    // ---- DELETE ----
    fireEvent.press(getByText(/delete/i));
    fireEvent.press(getByText(/confirm/i)); // confirm modal
    await waitFor(() => expect(mockDeleteMutation()[0]).toHaveBeenCalled());
    // List should no longer contain the resident
    await waitFor(() => expect(queryByText('John Doe')).toBeNull());
  });
});
