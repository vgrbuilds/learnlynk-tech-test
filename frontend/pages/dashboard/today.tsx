import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Task = {
  id: string;
  type: string;
  status: string;
  application_id: string;
  due_at: string;
};

export default function TodayDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTasks() {
    setLoading(true);
    setError(null);

    try {
      // Get today's date range
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // Fetch tasks due today (skip completed ones)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "completed")
        .gte("due_at", startOfToday.toISOString())
        .lte("due_at", endOfToday.toISOString())
        .order("due_at", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        setError("Failed to load tasks");
        return;
      }

      setTasks(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function markComplete(id: string) {
    try {
      // Mark it as complete in the database
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        alert("Failed to update task");
        return;
      }

      // Remove from the list right away (no need to re-fetch)
      setTasks((prevTasks: Task[]) => prevTasks.filter((task: Task) => task.id !== id));
    } catch (err: any) {
      console.error(err);
      alert("Failed to update task");
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>Loading tasks...</div>;
  if (error) return <div style={{ padding: "2rem", color: "#dc2626", fontFamily: "system-ui, sans-serif" }}>{error}</div>;

  const getTaskTypeBadge = (type: string) => {
    const colors = {
      call: { bg: "#dbeafe", text: "#1e40af" },
      email: { bg: "#fce7f3", text: "#9f1239" },
      review: { bg: "#d1fae5", text: "#065f46" },
    };
    const color = colors[type as keyof typeof colors] || { bg: "#f3f4f6", text: "#374151" };
    return (
      <span style={{
        backgroundColor: color.bg,
        color: color.text,
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        fontSize: "0.875rem",
        fontWeight: "500",
      }}>
        {type}
      </span>
    );
  };

  return (
    <main style={{
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, sans-serif",
      maxWidth: "1200px",
      margin: "0 auto",
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        padding: "2rem",
      }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.875rem", fontWeight: "700", color: "#111827" }}>
            Today&apos;s Tasks
          </h1>
          <p style={{ margin: "0.5rem 0 0 0", color: "#6b7280" }}>
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} due today
          </p>
        </div>

        {tasks.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "#6b7280",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
            <p style={{ margin: 0, fontSize: "1.125rem" }}>No tasks due today</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Application</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Due At</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t: Task) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "1rem" }}>{getTaskTypeBadge(t.type)}</td>
                    <td style={{ padding: "1rem", color: "#374151", fontFamily: "monospace", fontSize: "0.875rem" }}>
                      {t.application_id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: "1rem", color: "#374151" }}>{new Date(t.due_at).toLocaleString()}</td>
                    <td style={{ padding: "1rem", color: "#6b7280", textTransform: "capitalize" }}>{t.status}</td>
                    <td style={{ padding: "1rem" }}>
                      {t.status !== "completed" && (
                        <button
                          onClick={() => markComplete(t.id)}
                          style={{
                            backgroundColor: "#2563eb",
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "6px",
                            border: "none",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
