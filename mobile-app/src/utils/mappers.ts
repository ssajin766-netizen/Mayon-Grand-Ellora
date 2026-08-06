// Mapper utilities for Resident DTO and UI model
// Centralize transformation logic and keep the UI independent of backend field names.

import { ResidentDto, Resident, ResidentStatus } from "../types/resident";

/**
 * Translate backend status string to the mobile enum.
 * Covers known values and provides a fallback for unexpected ones.
 */
function mapResidentStatus(status: string): ResidentStatus {
  switch (status) {
    case "Active":
      return ResidentStatus.active;
    case "Moved Out":
      return ResidentStatus.inactive;
    case "Pending Approval":
      return ResidentStatus.pending;
    default:
      // Fallback – treat unknown as pending; could also throw.
      return ResidentStatus.pending;
  }
}

/**
 * Convert a Resident DTO (as received from the API) to the UI model used throughout the app.
 * The mapper is resilient to missing optional fields – it simply passes them through.
 */
export function mapResident(dto: ResidentDto): Resident {
  return {
    id: dto._id,
    // Preserve original name parts for editing scenarios
    firstName: dto.firstName,
    lastName: dto.lastName,
    fullName: `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim(),
    phone: dto.phone,
    email: dto.email,
    unitNumber: dto.unitNumber,
    category: dto.category,
    status: mapResidentStatus(dto.status as unknown as string),
    isPrimaryResident: dto.isPrimaryResident,
    emergencyContactName: dto.emergencyContactName,
    emergencyContactPhone: dto.emergencyContactPhone,
    moveInDate: dto.moveInDate,
    moveOutDate: dto.moveOutDate,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    profilePhotoUrl: dto.profilePhotoUrl,
  };
}

/**
 * Convert the UI model back to the DTO shape expected by the backend when submitting data.
 * Only fields present in the DTO are emitted.
 */
export function mapResidentToDto(resident: Resident): ResidentDto {
  return {
    _id: resident.id,
    firstName: resident.firstName ?? "",
    lastName: resident.lastName ?? "",
    phone: resident.phone,
    email: resident.email,
    unitNumber: resident.unitNumber,
    category: resident.category,
    status: resident.status,
    isPrimaryResident: resident.isPrimaryResident,
    emergencyContactName: resident.emergencyContactName,
    emergencyContactPhone: resident.emergencyContactPhone,
    moveInDate: resident.moveInDate,
    moveOutDate: resident.moveOutDate,
    createdAt: resident.createdAt,
    updatedAt: resident.updatedAt,
    profilePhotoUrl: resident.profilePhotoUrl,
  };
}
