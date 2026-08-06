// Mobile UI model for Resident, derived from backend DTO
export interface ResidentDto {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  unitNumber: string;
  category?: string;
  status: ResidentStatus;
  // Additional backend fields (optional in UI model)
  isPrimaryResident?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  moveInDate?: string;
  moveOutDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // UI‑only field, not yet provided by backend
  profilePhotoUrl?: string;
}

export interface Resident {
  id: string;
  // Preserve original name parts for editing scenarios
  firstName?: string;
  lastName?: string;
  // Full name for display purposes
  fullName: string;
  phone: string;
  email: string;
  unitNumber: string;
  category?: string;
  status: ResidentStatus;
  isPrimaryResident?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  moveInDate?: string;
  moveOutDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // UI‑only field; populated only when backend supplies it
  profilePhotoUrl?: string;
}

export enum ResidentStatus {
  active = "Active",
  inactive = "Moved Out",
  pending = "Pending Approval",
}
