import type { ProfileDocument } from "./Common";

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialty?: string;
  department?: string;
  yearsOfExperience?: number;
  licenseNumber?: string;
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
  address?: string;
  avatar?: string;
  document?: ProfileDocument;
  bio?: string;
  consultationFee?: number;
  languages?: string[];
  availability?: Array<
    | string
    | {
        day?: string;
        from?: string;
        to?: string;
      }
  >;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
