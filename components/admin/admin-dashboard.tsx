"use client";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  Mail,
  MailPlus,
  Menu,
  Newspaper,
  Plus,
  Rocket,
  Save,
  Trash2,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LogoutButton } from "@/components/admin/logout-button";
import {
  adminTableConfigs,
  adminTableKeys,
  type AdminField,
  type AdminTableConfig,
  type AdminTableKey
} from "@/lib/admin-tables";

export type AdminRow = Record<string, string | null>;
export type AdminRowsByTable = Record<AdminTableKey, AdminRow[]>;

type ActiveTab = "overview" | AdminTableKey;

const launchStartTime = new Date("2026-01-01T00:00:00-05:00").getTime();
const launchDate = new Date("2026-10-31T23:59:59-04:00");
const launchTime = launchDate.getTime();
const launchWindow = launchTime - launchStartTime;

const navItems: Array<{ key: ActiveTab; label: string; icon: React.ElementType }> = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "driver_leads", label: "Drivers", icon: Users },
  { key: "partner_inquiries", label: "Partners", icon: BarChart3 },
  { key: "contact_messages", label: "Contact Messages", icon: Mail },
  { key: "newsletter_subscribers", label: "Newsletters", icon: Newspaper },
  { key: "board_members", label: "Board Members", icon: Users }
];

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", hour: "numeric", minute: "2-digit" }).format(date);
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function getFullName(row: AdminRow) {
  return [row.first_name, row.last_name].filter(Boolean).join(" ") || row.email || row.organization || "Untitled";
}

function EmptyForm(config: AdminTableConfig) {
  return config.fields.reduce<Record<string, string>>((form, field) => {
    form[field.key] = field.options?.[0] ?? "";
    return form;
  }, {});
}

function StatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function MiniBarChart({ rows }: { rows: AdminRowsByTable }) {
  const data = adminTableKeys.map((key) => ({ key, label: adminTableConfigs[key].label, value: rows[key]?.length ?? 0 }));
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <h2>Submission Mix</h2>
          <p>Records currently loaded from Supabase.</p>
        </div>
      </div>
      <div className="admin-bars">
        {data.map((item) => (
          <div className="admin-bar-row" key={item.key}>
            <span>{item.label}</span>
            <div className="admin-bar-track">
              <div className="admin-bar-fill" style={{ width: `${Math.max((item.value / max) * 100, item.value ? 10 : 2)}%` }} />
            </div>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function getLaunchCountdown() {
  const now = Date.now();
  const remainingMs = Math.max(launchTime - now, 0);
  const remainingPercent = launchWindow > 0 ? Math.max(Math.min((remainingMs / launchWindow) * 100, 100), 0) : 0;
  const days = Math.floor(remainingMs / 86_400_000);
  const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1_000);
  const colorMode = remainingPercent < 30 ? "red" : remainingPercent < 50 ? "orange" : "green";

  return { days, hours, minutes, seconds, remainingPercent, colorMode };
}

function LaunchCountdown() {
  const [countdown, setCountdown] = useState<ReturnType<typeof getLaunchCountdown> | null>(null);

  useEffect(() => {
    setCountdown(getLaunchCountdown());
    const interval = window.setInterval(() => setCountdown(getLaunchCountdown()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const progress = countdown?.remainingPercent ?? 0;

  return (
    <div className={`admin-countdown-card ${countdown?.colorMode ?? "green"}`}>
      <div className="admin-countdown-copy">
        <span className="admin-kicker">Launch Countdown</span>
        <h2>October 31, 2026</h2>
        <p>Time remaining until PaDC&apos;s target launch date.</p>
      </div>
      <div className="admin-countdown-clock" style={{ "--countdown-progress": `${progress}%` } as React.CSSProperties}>
        <div className="admin-countdown-orbit">
          <Rocket size={22} />
        </div>
        <strong>{countdown ? countdown.days : "--"}</strong>
        <span>days</span>
      </div>
      <div className="admin-countdown-units">
        <div>
          <strong>{countdown ? String(countdown.hours).padStart(2, "0") : "--"}</strong>
          <span>Hours</span>
        </div>
        <div>
          <strong>{countdown ? String(countdown.minutes).padStart(2, "0") : "--"}</strong>
          <span>Minutes</span>
        </div>
        <div>
          <strong>{countdown ? String(countdown.seconds).padStart(2, "0") : "--"}</strong>
          <span>Seconds</span>
        </div>
      </div>
    </div>
  );
}

function RecordForm({
  config,
  initial,
  submitLabel,
  onSubmit,
  onCancel
}: {
  config: AdminTableConfig;
  initial?: AdminRow;
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const empty = EmptyForm(config);
    if (!initial) return empty;
    return config.fields.reduce<Record<string, string>>((form, field) => {
      form[field.key] = String(initial[field.key] ?? empty[field.key] ?? "");
      return form;
    }, {});
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save record.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-record-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        {config.fields.filter((field) => field.form !== false).map((field) => (
          <label className={field.type === "textarea" ? "admin-field admin-field-wide" : "admin-field"} key={field.key}>
            <span>
              {field.label}
              {field.required || (!initial && field.createRequired) ? " *" : ""}
            </span>
            <AdminInput
              field={field}
              value={values[field.key] ?? ""}
              required={Boolean(field.required || (!initial && field.createRequired))}
              onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
            />
          </label>
        ))}
      </div>
      {error ? <div className="admin-error">{error}</div> : null}
      <div className="admin-form-actions">
        {onCancel ? (
          <button className="admin-ghost-button" type="button" onClick={onCancel}>
            <X size={16} /> Cancel
          </button>
        ) : null}
        <button className="admin-primary-button" type="submit" disabled={busy}>
          <Save size={16} /> {busy ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function AdminInput({
  field,
  value,
  required,
  onChange
}: {
  field: AdminField;
  value: string;
  required: boolean;
  onChange: (value: string) => void;
}) {
  if (field.type === "textarea") {
    return <textarea value={value} required={required} onChange={(event) => onChange(event.target.value)} />;
  }

  if (field.type === "select") {
    return (
      <select value={value} required={required} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select...</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type ?? "text"}
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function RecordsTable({
  config,
  rows,
  onCreate,
  onUpdate,
  onDelete,
  onInvite
}: {
  config: AdminTableConfig;
  rows: AdminRow[];
  onCreate: (table: AdminTableKey, values: Record<string, string>) => Promise<void>;
  onUpdate: (table: AdminTableKey, id: string, values: Record<string, string>) => Promise<void>;
  onDelete: (table: AdminTableKey, id: string) => Promise<void>;
  onInvite: (id: string) => Promise<void>;
}) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState("");
  const visibleFields = config.fields.filter((field) => field.table);
  const activeRows = rows.filter((row) => row.status !== "archived" && row.status !== "inactive").length;

  return (
    <section className="admin-section">
      <div className="admin-stat-grid">
        <StatCard label="Total records" value={rows.length} detail="All records loaded" />
        <StatCard label="Active" value={activeRows} detail="Not archived or inactive" />
        <StatCard label="Newest" value={rows[0] ? formatDate(rows[0].created_at) : "-"} detail="Most recent record" />
      </div>

      <div className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>{config.label}</h2>
            <p>{config.description}</p>
          </div>
          <button className="admin-primary-button" type="button" onClick={() => setCreating(true)}>
            <Plus size={16} /> Add {config.singular}
          </button>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Created</th>
                {visibleFields.map((field) => (
                  <th key={field.key}>{field.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={String(row.id)}>
                    <td>{formatDate(row.created_at)}</td>
                    {visibleFields.map((field) => (
                      <td key={field.key}>{displayValue(row[field.key])}</td>
                    ))}
                    <td>
                      <div className="admin-row-actions">
                        {config.key === "board_members" ? (
                          <button
                            className="admin-ghost-button"
                            type="button"
                            disabled={row.auth_status === "active" || invitingId === row.id}
                            title={row.auth_status === "active" ? "Portal access is active" : "Send a secure account invitation"}
                            onClick={async () => {
                              setInvitingId(String(row.id));
                              setInviteError("");
                              try {
                                await onInvite(String(row.id));
                              } catch (err) {
                                setInviteError(err instanceof Error ? err.message : "Unable to send invitation.");
                              } finally {
                                setInvitingId(null);
                              }
                            }}
                          >
                            <MailPlus size={15} />
                            {row.auth_status === "active"
                              ? "Access active"
                              : invitingId === row.id
                                ? "Sending..."
                                : row.auth_status === "invited"
                                  ? "Resend invite"
                                  : "Send invite"}
                          </button>
                        ) : null}
                        <button className="admin-ghost-button" type="button" onClick={() => setEditingId(String(row.id))}>
                          Edit
                        </button>
                        <button className="admin-danger-button" type="button" onClick={() => onDelete(config.key, String(row.id))}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleFields.length + 2}>No records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {inviteError ? <div className="admin-error">{inviteError}</div> : null}
        {creating ? (
          <RecordModal
            title={`Add ${config.singular}`}
            description={`Create a new ${config.singular} record in Supabase.`}
            onClose={() => setCreating(false)}
          >
            <RecordForm
              config={config}
              submitLabel={`Create ${config.singular}`}
              onCancel={() => setCreating(false)}
              onSubmit={async (values) => {
                await onCreate(config.key, values);
                setCreating(false);
              }}
            />
          </RecordModal>
        ) : null}
        {editingId ? (
          <RecordModal
            title={`Edit ${config.singular}`}
            description="Update the Supabase record and refresh the dashboard state."
            onClose={() => setEditingId(null)}
          >
            <RecordForm
              config={config}
              initial={rows.find((row) => row.id === editingId)}
              submitLabel="Save changes"
              onCancel={() => setEditingId(null)}
              onSubmit={async (values) => {
                await onUpdate(config.key, editingId, values);
                setEditingId(null);
              }}
            />
          </RecordModal>
        ) : null}
      </div>
    </section>
  );
}

function RecordModal({
  title,
  description,
  children,
  onClose
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <div className="admin-panel-heading">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button className="admin-icon-button" type="button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Overview({
  rows,
  onCreate
}: {
  rows: AdminRowsByTable;
  onCreate: (table: AdminTableKey, values: Record<string, string>) => Promise<void>;
}) {
  const [quickCreateTable, setQuickCreateTable] = useState<AdminTableKey | null>(null);
  const totalRecords = adminTableKeys.reduce((sum, key) => sum + (rows[key]?.length ?? 0), 0);
  const recent = adminTableKeys
    .flatMap((key) => (rows[key] ?? []).map((row) => ({ key, row })))
    .sort((a, b) => new Date(String(b.row.created_at)).getTime() - new Date(String(a.row.created_at)).getTime())
    .slice(0, 8);

  return (
    <section className="admin-section">
      <div className="admin-stat-grid">
        <StatCard label="Total records" value={totalRecords} detail="Across all dashboard tables" />
        <StatCard label="Driver leads" value={rows.driver_leads.length} detail="People interested in driving" />
        <StatCard label="Partners" value={rows.partner_inquiries.length} detail="Partner and funder inquiries" />
        <StatCard label="Board members" value={rows.board_members.length} detail="Leadership records" />
      </div>

      <LaunchCountdown />

      <div className="admin-overview-grid">
        <MiniBarChart rows={rows} />
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Newest records from Supabase.</p>
            </div>
          </div>
          <div className="admin-activity-list">
            {recent.length ? (
              recent.map(({ key, row }) => (
                <div className="admin-activity-item" key={`${key}-${row.id}`}>
                  <strong>{getFullName(row)}</strong>
                  <span>{adminTableConfigs[key].label}</span>
                  <small>{formatDate(row.created_at)}</small>
                </div>
              ))
            ) : (
              <p>No activity yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Quick Add</h2>
            <p>Create authorized records directly from the overview.</p>
          </div>
        </div>
        <div className="admin-quick-grid">
          {(["driver_leads", "partner_inquiries", "board_members"] as AdminTableKey[]).map((key) => (
            <div className="admin-quick-card" key={key}>
              <h3>Add {adminTableConfigs[key].singular}</h3>
              <p>{adminTableConfigs[key].description}</p>
              <button className="admin-primary-button" type="button" onClick={() => setQuickCreateTable(key)}>
                <Plus size={16} /> Add {adminTableConfigs[key].singular}
              </button>
            </div>
          ))}
        </div>
        {quickCreateTable ? (
          <RecordModal
            title={`Add ${adminTableConfigs[quickCreateTable].singular}`}
            description={`Create a new ${adminTableConfigs[quickCreateTable].singular} record from the overview.`}
            onClose={() => setQuickCreateTable(null)}
          >
            <RecordForm
              config={adminTableConfigs[quickCreateTable]}
              submitLabel="Create"
              onCancel={() => setQuickCreateTable(null)}
              onSubmit={async (values) => {
                await onCreate(quickCreateTable, values);
                setQuickCreateTable(null);
              }}
            />
          </RecordModal>
        ) : null}
      </div>
    </section>
  );
}

export function AdminDashboard({ initialRows }: { initialRows: AdminRowsByTable }) {
  const [rows, setRows] = useState<AdminRowsByTable>(() => {
    return adminTableKeys.reduce<AdminRowsByTable>((state, key) => {
      state[key] = initialRows[key] ?? [];
      return state;
    }, {} as AdminRowsByTable);
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = activeTab === "overview" ? "Overview" : adminTableConfigs[activeTab].label;
  const subtitle =
    activeTab === "overview"
      ? "Operational snapshot across PaDC intake, partners, communications, and leadership."
      : adminTableConfigs[activeTab].description;

  const tableStats = useMemo(
    () => adminTableKeys.map((key) => ({ key, label: adminTableConfigs[key].label, count: rows[key]?.length ?? 0 })),
    [rows]
  );

  async function refreshTable(table: AdminTableKey) {
    const response = await fetch(`/api/admin/records/${table}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Unable to refresh table.");
    setRows((current) => ({ ...current, [table]: result.rows ?? [] }));
  }

  async function createRecord(table: AdminTableKey, values: Record<string, string>) {
    const response = await fetch(`/api/admin/records/${table}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Unable to create record.");
    setRows((current) => ({ ...current, [table]: [result.row, ...(current[table] ?? [])] }));
  }

  async function updateRecord(table: AdminTableKey, id: string, values: Record<string, string>) {
    const response = await fetch(`/api/admin/records/${table}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Unable to update record.");
    setRows((current) => ({ ...current, [table]: current[table].map((row) => (row.id === id ? result.row : row)) }));
  }

  async function deleteRecord(table: AdminTableKey, id: string) {
    const confirmed = window.confirm("Delete this record from Supabase?");
    if (!confirmed) return;

    const response = await fetch(`/api/admin/records/${table}/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Unable to delete record.");
    setRows((current) => ({ ...current, [table]: current[table].filter((row) => row.id !== id) }));
  }

  async function inviteBoardMember(id: string) {
    const response = await fetch(`/api/admin/board-members/${id}/invite`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Unable to send invitation.");
    setRows((current) => ({
      ...current,
      board_members: current.board_members.map((row) => (row.id === id ? result.row : row))
    }));
  }

  return (
    <main className="admin-dashboard-shell">
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <div>
            <strong>
              Pa<span>DC</span>
            </strong>
            {!collapsed ? <small>Admin Console</small> : null}
          </div>
          <button
            className="admin-icon-button admin-sidebar-toggle desktop-only"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="admin-sidebar-nav" aria-label="Admin sections">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            const count = item.key === "overview" ? null : tableStats.find((stat) => stat.key === item.key)?.count;
            return (
              <button
                className={active ? "active" : ""}
                key={item.key}
                type="button"
                aria-label={item.label}
                title={item.label}
                onClick={() => {
                  setActiveTab(item.key);
                  setMobileOpen(false);
                }}
              >
                <Icon size={18} />
                {!collapsed ? <span>{item.label}</span> : null}
                {!collapsed && count !== null && count !== undefined ? <small>{count}</small> : null}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="admin-dashboard-content">
        <header className="admin-topbar">
          <button className="admin-icon-button mobile-only" type="button" onClick={() => setMobileOpen((value) => !value)}>
            <Menu size={20} />
          </button>
          <div>
            <span className="admin-kicker">PaDC Admin</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <LogoutButton />
        </header>

        {activeTab === "overview" ? (
          <Overview rows={rows} onCreate={createRecord} />
        ) : (
          <RecordsTable
            config={adminTableConfigs[activeTab]}
            rows={rows[activeTab]}
            onCreate={createRecord}
            onUpdate={updateRecord}
            onDelete={deleteRecord}
            onInvite={inviteBoardMember}
          />
        )}
      </section>
    </main>
  );
}
