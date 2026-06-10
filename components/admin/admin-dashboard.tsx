"use client";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  Mail,
  Menu,
  Newspaper,
  Plus,
  Save,
  Trash2,
  Users,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
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
        {config.fields.map((field) => (
          <label className={field.type === "textarea" ? "admin-field admin-field-wide" : "admin-field"} key={field.key}>
            <span>
              {field.label}
              {field.required ? " *" : ""}
            </span>
            <AdminInput field={field} value={values[field.key] ?? ""} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} />
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

function AdminInput({ field, value, onChange }: { field: AdminField; value: string; onChange: (value: string) => void }) {
  if (field.type === "textarea") {
    return <textarea value={value} onChange={(event) => onChange(event.target.value)} />;
  }

  if (field.type === "select") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select...</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return <input type={field.type ?? "text"} value={value} onChange={(event) => onChange(event.target.value)} />;
}

function RecordsTable({
  config,
  rows,
  onCreate,
  onUpdate,
  onDelete
}: {
  config: AdminTableConfig;
  rows: AdminRow[];
  onCreate: (table: AdminTableKey, values: Record<string, string>) => Promise<void>;
  onUpdate: (table: AdminTableKey, id: string, values: Record<string, string>) => Promise<void>;
  onDelete: (table: AdminTableKey, id: string) => Promise<void>;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
          <button className="admin-primary-button" type="button" onClick={() => setShowCreate((value) => !value)}>
            <Plus size={16} /> Add {config.singular}
          </button>
        </div>
        {showCreate ? (
          <div className="admin-create-panel">
            <RecordForm
              config={config}
              submitLabel={`Create ${config.singular}`}
              onCancel={() => setShowCreate(false)}
              onSubmit={async (values) => {
                await onCreate(config.key, values);
                setShowCreate(false);
              }}
            />
          </div>
        ) : null}
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
        {editingId ? (
          <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
            <div className="admin-modal">
              <div className="admin-panel-heading">
                <div>
                  <h2>Edit {config.singular}</h2>
                  <p>Update the Supabase record and refresh the dashboard state.</p>
                </div>
                <button className="admin-icon-button" type="button" onClick={() => setEditingId(null)}>
                  <X size={18} />
                </button>
              </div>
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
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Overview({
  rows,
  onCreate
}: {
  rows: AdminRowsByTable;
  onCreate: (table: AdminTableKey, values: Record<string, string>) => Promise<void>;
}) {
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
              <RecordForm config={adminTableConfigs[key]} submitLabel="Create" onSubmit={(values) => onCreate(key, values)} />
            </div>
          ))}
        </div>
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
          <button className="admin-icon-button desktop-only" type="button" onClick={() => setCollapsed((value) => !value)}>
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
          />
        )}
      </section>
    </main>
  );
}
