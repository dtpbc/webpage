export type ClubRole = 'member' | 'executive' | 'sponsor_teacher';
export type AppStaffRole = 'executive' | 'sponsor_teacher';
export type SkillLevel = 'Beginner (Learning Rules)' | 'Intermediate (Consistent Rallies)' | 'Advanced (Competitive Play)';
export type GymLayoutOption = '4 Portable Pickleball Courts (Main Gym)' | '4 Badminton-Style Nets' | '8 Courts (Double Gym Combined)';

export interface User {
  id: string;
  memberId: string; // Distinct DTPBC Club Member ID, e.g. "PB-1042" (separate from school student ID)
  name: string;
  studentId: string; // 7-digit school number, e.g. "1842109"
  grade: 'Grade 8' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12' | 'Staff / Teacher';
  email: string;
  role: ClubRole;
  skillLevel: SkillLevel;
  joinDate: string;
}

export interface ClubSession {
  id: string;
  title: string;
  date?: string; // Optional specific ISO date YYYY-MM-DD for calendar clicking
  time: string;
  location: string;
  gymLayout: GymLayoutOption;
  description: string;
  spotsOpen: string;
  coordinator: string;
  status: 'Open' | 'Starting Soon' | 'Completed';
}

export interface SpecialEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or formatted date string
  time: string;
  location: string;
  category: string;
  registeredCount: number;
  maxTeams: number;
  description: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string; // DTPBC Member ID
  studentId: string; // 7-digit Student Number
  studentName: string;
  grade: string;
  timestamp: string;
  scannedBy: string;
  eventId: string;
  eventTitle: string;
}

export interface RosterMember extends User {}

export interface FundraisingItem {
  id: string;
  title: string;
  description: string;
  price: string;
  source: string;
  howToGet: string;
  active: boolean;
  createdAt: string;
}

export interface ExecutiveMember {
  name: string;
  role: string;
  category: 'President' | 'Vice President' | 'Core Officer' | 'Member-at-large' | 'Teacher Sponsor';
  grade: string;
  photoFilename: string; // e.g. "president.jpg", "t-sponsor.png"
  responsibilities: string[];
  bio: string;
}
