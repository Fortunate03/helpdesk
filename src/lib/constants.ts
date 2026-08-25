import type { Category, Department, Priority, TicketStatus } from "@/db/schema";

/** Single source of truth for branding and contact details shown across the site. */
export const SITE = {
  name: "ICT Help Desk",
  tagline: "Technical support, tracked from report to resolution.",
  description:
    "Report ICT problems, follow their progress, and get help from the support team, all in one place.",
  email: "contact@helpdesk.co.za",
  // Grouped for reading; the tel: link keeps the unformatted E.164 form that
  // dialers expect.
  phone: "+27 123 456 789",
  phoneHref: "tel:+27123456789",
  office: "Block C, Ground Floor, Room C012",
  campus: "Cnr Nind & Beit Street, Doornfontein, Johannesburg, 2094",
  hours: [{ days: "Monday to Friday", time: "07:30 - 16:00" }],
} as const;

export const STATUS_LABELS: Record<TicketStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export const STATUS_DESCRIPTIONS: Record<TicketStatus, string> = {
  PENDING: "Received and waiting for a technician to start work on it.",
  IN_PROGRESS: "A technician is actively working on this request.",
  RESOLVED: "The issue has been fixed and the request is closed.",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  HARDWARE: "Hardware",
  SOFTWARE: "Software",
  NETWORK: "Network & Wi-Fi",
  ACCOUNT_ACCESS: "Account & Access",
  EMAIL: "Email",
  PRINTING: "Printing",
  OTHER: "Other",
};

export const CATEGORY_HINTS: Record<Category, string> = {
  HARDWARE: "Desktops, laptops, monitors, peripherals",
  SOFTWARE: "Installations, licences, application errors",
  NETWORK: "Wi-Fi, cabled connections, VPN access",
  ACCOUNT_ACCESS: "Passwords, lockouts, permissions",
  EMAIL: "Mailbox access, delivery problems, quotas",
  PRINTING: "Printers, scanners, print quotas",
  OTHER: "Anything that does not fit the categories above",
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  ADMINISTRATION: "Administration",
  ACADEMIC_STAFF: "Academic Staff",
  STUDENT_SERVICES: "Student Services",
  FINANCE: "Finance",
  LIBRARY: "Library",
  IT: "ICT Department",
  STUDENT: "Student",
  OTHER: "Other",
};

export type NavLink = { href: string; label: string };

/** Shown in every state. Role-specific links are appended in the header. */
export const PRIMARY_NAV: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/submit", label: "Submit Request" },
];

/** Introductory pages, which are what a visitor without an account is looking for. */
export const PUBLIC_NAV: readonly NavLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

/** Needs a session, so linking to it while signed out only leads to the login page. */
export const ACCOUNT_NAV: readonly NavLink[] = [{ href: "/my-requests", label: "My Requests" }];

export function navFor(signedIn: boolean): readonly NavLink[] {
  return signedIn ? [...PRIMARY_NAV, ...ACCOUNT_NAV] : [...PRIMARY_NAV, ...PUBLIC_NAV];
}
