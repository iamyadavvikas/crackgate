"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

type Point = { date: string; count: number };
type Overview = {
  series: {
    signups: Point[];
    attempts: Point[];
    activity: Point[];
    dau: Point[];
  };
};

function shortDate(d: string): string {
  // YYYY-MM-DD → DD MMM
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" });
}

export function AdminCharts() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card p-6 mt-8 text-center text-sm text-muted">Loading trends…</div>;
  if (!data) return null;

  const signups = data.series.signups.map((p) => ({ ...p, label: shortDate(p.date) }));
  const attempts = data.series.attempts.map((p) => ({ ...p, label: shortDate(p.date) }));
  const dau = data.series.dau.map((p) => ({ ...p, label: shortDate(p.date) }));

  return (
    <section className="mt-8 grid lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h2 className="font-bold text-lg">Signups (30 days)</h2>
        <p className="text-sm text-muted">New user registrations per day.</p>
        <div className="w-full h-64 mt-4">
          <ResponsiveContainer>
            <BarChart data={signups} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={3} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--brand, #4f46e5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg">Daily Active Users (30 days)</h2>
        <p className="text-sm text-muted">Unique users with any activity event per day.</p>
        <div className="w-full h-64 mt-4">
          <ResponsiveContainer>
            <LineChart data={dau} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={3} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="DAU" stroke="var(--brand-2, #7c3aed)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6 lg:col-span-2">
        <h2 className="font-bold text-lg">Attempts per day (30 days)</h2>
        <p className="text-sm text-muted">Mock submissions across all users.</p>
        <div className="w-full h-64 mt-4">
          <ResponsiveContainer>
            <BarChart data={attempts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
