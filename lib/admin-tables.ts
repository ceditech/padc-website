export type AdminTableKey =
  | "driver_leads"
  | "partner_inquiries"
  | "contact_messages"
  | "newsletter_subscribers"
  | "board_members";

export type AdminFieldType = "text" | "email" | "tel" | "textarea" | "select";

export type AdminField = {
  key: string;
  label: string;
  type?: AdminFieldType;
  required?: boolean;
  options?: string[];
  table?: boolean;
  overview?: boolean;
};

export type AdminTableConfig = {
  key: AdminTableKey;
  label: string;
  singular: string;
  description: string;
  fields: AdminField[];
};

const statuses = ["new", "contacted", "qualified", "scheduled", "archived"];

export const adminTableConfigs: Record<AdminTableKey, AdminTableConfig> = {
  driver_leads: {
    key: "driver_leads",
    label: "Drivers",
    singular: "driver",
    description: "Driver interest submissions and recruiting pipeline.",
    fields: [
      { key: "first_name", label: "First name", required: true, table: true, overview: true },
      { key: "last_name", label: "Last name", required: true, table: true, overview: true },
      { key: "email", label: "Email", type: "email", required: true, table: true },
      { key: "phone", label: "Phone", type: "tel", table: true },
      { key: "neighborhood", label: "Neighborhood", table: true },
      { key: "platforms", label: "Platforms", table: true },
      { key: "source", label: "Source" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: statuses, table: true }
    ]
  },
  partner_inquiries: {
    key: "partner_inquiries",
    label: "Partners",
    singular: "partner",
    description: "Partner and funder inquiries.",
    fields: [
      { key: "first_name", label: "First name", required: true, table: true, overview: true },
      { key: "last_name", label: "Last name", required: true, table: true, overview: true },
      { key: "organization", label: "Organization", required: true, table: true, overview: true },
      { key: "title", label: "Title / role", table: true },
      { key: "email", label: "Email", type: "email", required: true, table: true },
      { key: "phone", label: "Phone", type: "tel" },
      {
        key: "inquiry_type",
        label: "Inquiry type",
        type: "select",
        required: true,
        table: true,
        options: [
          "Funding or grant opportunity",
          "Cooperative development partnership",
          "Workforce development partnership",
          "Community organization partnership",
          "City or government inquiry",
          "Research or academic inquiry",
          "Media inquiry",
          "Other"
        ]
      },
      { key: "message", label: "Message", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: statuses, table: true }
    ]
  },
  contact_messages: {
    key: "contact_messages",
    label: "Contact Messages",
    singular: "message",
    description: "General contact messages routed through the website.",
    fields: [
      { key: "first_name", label: "First name", required: true, table: true },
      { key: "last_name", label: "Last name", required: true, table: true },
      { key: "organization", label: "Organization", table: true },
      { key: "email", label: "Email", type: "email", required: true, table: true },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "persona", label: "I am a", required: true, table: true },
      { key: "subject", label: "Subject", required: true, table: true },
      { key: "message", label: "Message", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: statuses, table: true }
    ]
  },
  newsletter_subscribers: {
    key: "newsletter_subscribers",
    label: "Newsletters",
    singular: "subscriber",
    description: "Newsletter subscribers and email audience status.",
    fields: [
      { key: "email", label: "Email", type: "email", required: true, table: true, overview: true },
      { key: "source", label: "Source", table: true },
      { key: "status", label: "Status", type: "select", options: ["active", "unsubscribed", "bounced"], table: true }
    ]
  },
  board_members: {
    key: "board_members",
    label: "Board Members",
    singular: "board member",
    description: "Board and organizing leadership records.",
    fields: [
      { key: "first_name", label: "First name", required: true, table: true, overview: true },
      { key: "last_name", label: "Last name", required: true, table: true, overview: true },
      { key: "role", label: "Role", required: true, table: true, overview: true },
      { key: "organization", label: "Organization", table: true },
      { key: "email", label: "Email", type: "email", table: true },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["active", "inactive"], table: true }
    ]
  }
};

export const adminTableKeys = Object.keys(adminTableConfigs) as AdminTableKey[];

export function getAdminTableConfig(table: string) {
  return adminTableConfigs[table as AdminTableKey] ?? null;
}

export function sanitizeAdminRecord(table: AdminTableKey, payload: unknown, options?: { partial?: boolean }) {
  const config = adminTableConfigs[table];
  const input = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};

  return config.fields.reduce<Record<string, string | null>>((record, field) => {
    if (options?.partial && !(field.key in input)) {
      return record;
    }

    const value = input[field.key];
    const normalized = typeof value === "string" ? value.trim() : "";
    record[field.key] = normalized || null;
    return record;
  }, {});
}

export function validateAdminRecord(
  table: AdminTableKey,
  record: Record<string, string | null>,
  options?: { requireRequiredFields?: boolean }
) {
  const config = adminTableConfigs[table];
  const shouldRequireFields = options?.requireRequiredFields ?? true;
  const missing = shouldRequireFields ? config.fields.filter((field) => field.required && !record[field.key]) : [];

  if (missing.length) {
    return `${missing[0].label} is required.`;
  }

  const emailField = config.fields.find((field) => field.type === "email" && record[field.key]);
  if (emailField) {
    const value = record[emailField.key] ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${emailField.label} must be a valid email address.`;
    }
  }

  return null;
}
