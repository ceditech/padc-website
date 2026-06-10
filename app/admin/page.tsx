import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/logout-button";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type Row = Record<string, string | null>;

async function getRows(table: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return [];
  }

  return (data ?? []) as Row[];
}

function Value({ value }: { value: unknown }) {
  if (!value) return <span style={{ color: "#9ca3af" }}>-</span>;
  return <>{String(value)}</>;
}

function LeadTable({
  title,
  rows,
  columns
}: {
  title: string;
  rows: Row[];
  columns: Array<{ key: string; label: string }>;
}) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={String(row.id)}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <Value value={row[column.key]} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>No records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function AdminPage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) redirect("/admin/login");

  const [drivers, partners, contacts, subscribers] = await Promise.all([
    getRows("driver_leads"),
    getRows("partner_inquiries"),
    getRows("contact_messages"),
    getRows("newsletter_subscribers")
  ]);

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div className="section-inner" style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <span className="eyebrow">PaDC Admin</span>
            <h1 style={{ margin: 0 }}>Lead dashboard</h1>
          </div>
          <LogoutButton />
        </div>
      </header>
      <div className="admin-main">
        <LeadTable
          title="Driver interest"
          rows={drivers}
          columns={[
            { key: "created_at", label: "Received" },
            { key: "first_name", label: "First" },
            { key: "last_name", label: "Last" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "neighborhood", label: "Area" },
            { key: "platforms", label: "Platforms" },
            { key: "status", label: "Status" }
          ]}
        />
        <LeadTable
          title="Partner inquiries"
          rows={partners}
          columns={[
            { key: "created_at", label: "Received" },
            { key: "organization", label: "Organization" },
            { key: "first_name", label: "First" },
            { key: "last_name", label: "Last" },
            { key: "email", label: "Email" },
            { key: "inquiry_type", label: "Type" },
            { key: "status", label: "Status" }
          ]}
        />
        <LeadTable
          title="Contact messages"
          rows={contacts}
          columns={[
            { key: "created_at", label: "Received" },
            { key: "first_name", label: "First" },
            { key: "last_name", label: "Last" },
            { key: "email", label: "Email" },
            { key: "persona", label: "Persona" },
            { key: "subject", label: "Subject" },
            { key: "status", label: "Status" }
          ]}
        />
        <LeadTable
          title="Newsletter subscribers"
          rows={subscribers}
          columns={[
            { key: "created_at", label: "Joined" },
            { key: "email", label: "Email" },
            { key: "source", label: "Source" },
            { key: "status", label: "Status" }
          ]}
        />
      </div>
    </main>
  );
}
