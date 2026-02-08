
import { Complaint, ComplaintStatus, Priority, Sentiment, User, UserRole } from '../types';

// --- MOCK USERS GENERATION ---
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];

const generateUser = (id: string, role: UserRole, index: number): User => {
  const fName = firstNames[index % firstNames.length];
  const lName = lastNames[index % lastNames.length];
  return {
    id,
    name: `${fName} ${lName}`,
    email: role === UserRole.STAFF
      ? `${fName.toLowerCase()}.staff@cms.com`
      : `${fName.toLowerCase()}@gmail.com`,
    role,
    avatar: `https://i.pravatar.cc/150?u=${id}`,
    points: role === UserRole.STAFF ? Math.floor(Math.random() * 5000) : undefined,
    badges: role === UserRole.STAFF && Math.random() > 0.5 ? ['🏆 Quick Resolver', '⭐ Customer Champion', '🔥 Speed Demon', '💎 Quality Expert'].slice(0, Math.floor(Math.random() * 3) + 1) : []
  };
};

// Fixed Users for Credentials
export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin Administrator', email: 'admin@cms.com', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Staff', email: 'sarah.staff@cms.com', role: UserRole.STAFF, avatar: 'https://i.pravatar.cc/150?u=2', points: 3420, badges: ['⭐ Customer Champion'] },
  { id: '3', name: 'Alex Student', email: 'student@university.edu', role: UserRole.STUDENT, avatar: 'https://i.pravatar.cc/150?u=3' },
  // Generate more staff
  ...Array.from({ length: 12 }).map((_, i) => generateUser(`${i + 10}`, UserRole.STAFF, i)),
  // Generate more students
  ...Array.from({ length: 10 }).map((_, i) => generateUser(`${i + 30}`, UserRole.STUDENT, i + 5)),
];

// --- MOCK COMPLAINTS GENERATION ---
const categories = ['Technical', 'Billing', 'Product', 'Service', 'Security', 'Hardware', 'Feature Request'];
const descriptions = [
  "The system is throwing a 500 error when I try to export PDF.",
  "I was charged twice for the monthly subscription.",
  "The dashboard is loading very slowly on mobile devices.",
  "I haven't received a response to my previous ticket #102.",
  "Feature request: Add dark mode to the reports section.",
  "Login fails when using Google SSO.",
  "The API documentation is outdated.",
  "My invoice amount is incorrect.",
  "The search functionality is broken.",
  "Staff was very helpful but the issue persists.",
  "The server seems to be down in the US East region.",
  "Unable to upload profile picture.",
  "Password reset link is expired immediately."
];

const now = new Date();
const oneHour = 60 * 60 * 1000;
const oneDay = 24 * oneHour;

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();

// Helper to determine sentiment based on text
const getSentimentForDesc = (desc: string): Sentiment => {
  if (desc.includes("charged twice") || desc.includes("down") || desc.includes("broken")) return Sentiment.ANGRY;
  if (desc.includes("slowly") || desc.includes("fails") || desc.includes("expired")) return Sentiment.FRUSTRATED;
  if (desc.includes("helpful")) return Sentiment.SATISFIED;
  return Sentiment.NEUTRAL;
};

const departments = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'Information Tech', 'Chemical', 'Biotech'];
const locations = ['Main Building', 'Library', 'Canteen', 'Hostel A', 'Hostel B', 'Sports Complex', 'Lab 1', 'Lab 2', 'Parking Lot', 'Auditorium'];

// Generate 120 complaints
export const MOCK_COMPLAINTS: Complaint[] = Array.from({ length: 120 }).map((_, i) => {
  const priority = getRandomItem(Object.values(Priority));
  const category = getRandomItem(categories);
  const desc = getRandomItem(descriptions);
  const sentiment = getSentimentForDesc(desc);

  // Distribute statuses realistically
  let status = ComplaintStatus.NEW;
  const rand = Math.random();
  if (rand > 0.8) status = ComplaintStatus.RESOLVED;
  else if (rand > 0.6) status = ComplaintStatus.IN_PROGRESS;
  else if (rand > 0.4) status = ComplaintStatus.ASSIGNED;
  else if (rand > 0.3) status = ComplaintStatus.CLOSED;

  const customer = getRandomItem(MOCK_USERS.filter(u => u.role === UserRole.STUDENT));
  const staff = status !== ComplaintStatus.NEW ? getRandomItem(MOCK_USERS.filter(u => u.role === UserRole.STAFF)) : undefined;

  const createdDate = new Date(now.getTime() - Math.random() * 30 * oneDay); // Last 30 days

  // Calculate specific SLA
  let slaTime = 0;
  if (priority === Priority.CRITICAL) slaTime = 2 * oneHour;
  else if (priority === Priority.HIGH) slaTime = 24 * oneHour;
  else if (priority === Priority.MEDIUM) slaTime = 3 * oneDay;
  else slaTime = 7 * oneDay;

  const slaDeadline = new Date(createdDate.getTime() + slaTime).toISOString();

  // New Mock Data Fields
  const studentId = `2024${(i + 1).toString().padStart(4, '0')}`;
  const department = getRandomItem(departments);
  const incidentLocation = getRandomItem(locations);
  const contactNumber = `98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const incidentDate = getRandomDate(new Date(createdDate.getTime() - 5 * oneDay), createdDate);

  return {
    id: `CMP-2024-${(i + 1).toString().padStart(5, '0')}`,
    title: `${category} Issue - ${i + 1}`,
    description: `${desc} (Ticket #${i + 1})`,
    category,
    priority,
    status,
    sentiment,
    createdAt: createdDate.toISOString(),
    updatedAt: getRandomDate(createdDate, now),
    slaDeadline,
    customerId: customer.id,
    customerName: customer.name,
    assignedTo: staff?.id,
    studentId,
    department,
    incidentLocation,
    contactNumber,
    incidentDate
  };
});

// SIMULATING JAVA BACKEND LOGIC IN TYPESCRIPT
export const analyzeSentiment = (text: string): Sentiment => {
  const lowerText = text.toLowerCase();
  const angryWords = ["terrible", "worst", "horrible", "unacceptable", "disgusted", "angry", "broken", "outage"];
  const frustratedWords = ["disappointed", "annoying", "frustrated", "slow", "fail", "wait", "stuck"];

  let score = 0;
  angryWords.forEach(w => { if (lowerText.includes(w)) score -= 2; });
  frustratedWords.forEach(w => { if (lowerText.includes(w)) score -= 1; });

  if (score < -3) return Sentiment.ANGRY;
  if (score < 0) return Sentiment.FRUSTRATED;
  return Sentiment.NEUTRAL;
};

export const suggestCategory = (text: string): string => {
  const lower = text.toLowerCase();

  // Sexual Harassment / Safety
  if (lower.includes('sexual') || lower.includes('harassment') || lower.includes('touch') || lower.includes('inappropriate') || lower.includes('unsafe') || lower.includes('abuse') || lower.includes('molest')) return 'Sexual Harassment';

  // Ragging
  if (lower.includes('ragging') || lower.includes('bully') || lower.includes('senior') || lower.includes('force') || lower.includes('threat')) return 'Ragging';

  // Discrimination
  if (lower.includes('caste') || lower.includes('religion') || lower.includes('gender') || lower.includes('discriminat') || lower.includes('bias')) return 'Discrimination';

  // Academic Issues
  if (lower.includes('grade') || lower.includes('exam') || lower.includes('class') || lower.includes('faculty') || lower.includes('teacher') || lower.includes('attendance') || lower.includes('lecture') || lower.includes('syllabus')) return 'Academic Issues';

  // Infrastructure
  if (lower.includes('fan') || lower.includes('light') || lower.includes('water') || lower.includes('wifi') || lower.includes('internet') || lower.includes('room') || lower.includes('hostel') || lower.includes('broken') || lower.includes('electricity')) return 'Infrastructure';

  // Canteen / Hygiene
  if (lower.includes('food') || lower.includes('mess') || lower.includes('canteen') || lower.includes('hygiene') || lower.includes('clean') || lower.includes('dirty') || lower.includes('washroom') || lower.includes('toilet') || lower.includes('water')) return 'Canteen/Hygiene';

  // Student Affairs
  if (lower.includes('election') || lower.includes('discipline') || lower.includes('event') || lower.includes('fee') || lower.includes('scholarship') || lower.includes('library')) return 'Student Affairs';

  return 'Other';
};

export const calculateSLA = (priority: Priority): string => {
  const now = new Date();
  switch (priority) {
    case Priority.CRITICAL: return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // +2 hours
    case Priority.HIGH: return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // +24 hours
    case Priority.MEDIUM: return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(); // +3 days
    default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // +7 days
  }
};
