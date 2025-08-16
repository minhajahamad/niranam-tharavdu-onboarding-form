export interface Child {
  name: string;
  gender: 'Son' | 'Daughter' | '';
}

export interface Relationships {
  parentOf: string[];
  childOf: string[];
  siblingOf: string[];
  spouseOf: string[];
}

export interface FamilyDetails {
  headOfFamily: string;
  branch: string;
}

export interface PersonalDetails {
  memberName: string;
  gender: string;
  dateOfBirth: string;
  isDeceased: string;
  dateOfDeath: string;
  maritalStatus: string;
  spouseName: string;
  weddingAnniversary: string;
  fatherName: string;
  motherName: string;
  familyPhoto: File | null;
  personalPhoto: File | null;
  numberOfChildren: number;
  children: Child[];
  relationships: Relationships;
}

export interface ContactInfo {
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  location: string;
}

export interface Employment {
  jobStatus: string;
  companyName: string;
  designation: string;
  workLocation: string;
}

export interface FormData {
  familyDetails: FamilyDetails;
  personalDetails: PersonalDetails;
  contactInfo: ContactInfo;
  employment: Employment;
}

export interface StepProps {
  data: any;
  onChange: (data: any) => void;
}