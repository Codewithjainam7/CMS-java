export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
  VICTIM = 'VICTIM'
}

export enum ComplaintStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum Sentiment {
  ANGRY = 'ANGRY',
  FRUSTRATED = 'FRUSTRATED',
  NEUTRAL = 'NEUTRAL',
  SATISFIED = 'SATISFIED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  points?: number; // For gamification
  badges?: string[];
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: ComplaintStatus;
  sentiment: Sentiment;
  createdAt: string; // ISO String
  updatedAt: string;
  slaDeadline: string;
  customerId: string;
  assignedTo?: string; // Staff ID
  customerName: string;
  studentId?: string;
  department?: string;
  contactNumber?: string;
  incidentDate?: string;
  incidentLocation?: string;
}

export interface Comment {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend?: number; // Percentage
  icon?: any;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  time: string;
  type: 'info' | 'alert' | 'success';
}