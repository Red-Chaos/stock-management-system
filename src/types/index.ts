import 'next-auth';

export interface UserPermissions {
  canDeleteSections: boolean;
  canDeleteCategories: boolean;
  canDeleteItems: boolean;
  canEditSensitiveItemFields: boolean;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'EMPLOYEE';
      permissions: UserPermissions;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
    permissions: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'EMPLOYEE';
    permissions: UserPermissions;
  }
}

export interface SectionSpecificFields {
  // Physics
  equipmentType?: string;
  calibrationDate?: string;
  nextCalibrationDue?: string;
  measurementRange?: string;
  accuracy?: string;
  powerRequirements?: string;
  plugType?: string;
  safetyHazardLevel?: string;
  condition?: string;

  // Chemistry
  casNumber?: string;
  chemicalFormula?: string;
  physicalState?: string;
  concentration?: string;
  dilutionStatus?: string;
  dilutionPercentage?: number;
  dilutionDescription?: string;
  lotNumber?: string;
  expirationDate?: string;
  hazardClassification?: string;
  storageRequirements?: string;
  sdsLink?: string;
  containerSize?: string;

  // Botany
  scientificName?: string;
  commonName?: string;
  plantFamily?: string;
  specimenType?: string;
  growthMedium?: string;
  storageTemperature?: string;
  humidityRange?: string;
  lightRequirements?: string;
  collectionDate?: string;
  originLocation?: string;
  preservationMethod?: string;

  // Medical
  fdaClassification?: string;
  sterilizationMethod?: string;
  sterilityStatus?: string;
  biocompatibilityClass?: string;
  regulatoryCertification?: string;
  dosageForm?: string;
  patientContact?: string;
}
