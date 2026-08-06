// src/test/fixtures/resident.ts
export const mockResident = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  email: 'john.doe@example.com',
  unitNumber: 'A-101',
  category: 'Owner',
  status: 'active' as const,
  type: 'owner' as const,
  profilePhotoUrl: undefined,
  emergencyContact: undefined,
};
