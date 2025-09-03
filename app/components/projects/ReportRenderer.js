"use client";
import { useEffect, useState } from "react";

export default function ReportRenderer({ template, value, onChange }) {
  const [data, setData] = useState(value || template.schema);
  const [users, setUsers] = useState([]);

  const update = (path, v) => {
    const next = structuredClone(data);
    let ref = next;
    for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
    ref[path[path.length - 1]] = v;
    setData(next);
    onChange?.(next);
  };

  // Load users for selects
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/getAll', { credentials: 'include' });
        const json = await res.json();
        if (!json || json.success === false) { setUsers([]); return; }
        const list = Array.isArray(json?.data?.users)
          ? json.data.users
          : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.data?.rows)
              ? json.data.rows
              : Array.isArray(json?.users)
                ? json.users
                : [];
        setUsers(list);
      } catch {}
    })();
  }, []);

  const labelFa = {
    client: "Client",
    project: "Project",
    contractNo: "Contract No",
    reportNo: "Report No",
    testDate: "Test Date",
    location: "Location",
    standard: "Standard",
    specimenData: "Specimen Data",
    testingTemp: "Testing Temperature",
    items: "Items",
    reportingResults: "Reporting Results",
    comment: "Comment",
    testedBy: "Tested By",
    reviewedBy: "Reviewed By",
    approvedBy: "Approved By",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">{data.formTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['client','project','contractNo','reportNo','testDate','location','standard'].map(k => (
          <div key={k}>
            <label className="block text-sm mb-1">{k} ({labelFa[k] || ''})</label>
            <input className="w-full border rounded px-3 py-2" value={data[k] || ''} onChange={(e)=>update([k], e.target.value)} />
          </div>
        ))}
      </div>
      <section>
        <h3 className="font-semibold mb-2">Specimen Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">location</label>
            <input className="w-full border rounded px-3 py-2" value={data.specimenData?.location || ''} onChange={(e)=>update(['specimenData','location'], e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">testingTemp</label>
            <input className="w-full border rounded px-3 py-2" value={data.specimenData?.testingTemp || ''} onChange={(e)=>update(['specimenData','testingTemp'], e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="min-w-[900px] w-full text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-right">itemName</th>
                <th className="p-2 text-right">condition</th>
                <th className="p-2 text-right">measurementRange</th>
                <th className="p-2 text-right">acceptanceRange</th>
                <th className="p-2 text-right">result</th>
                <th className="p-2 text-right">remark</th>
              </tr>
            </thead>
            <tbody>
              {(data.specimenData?.items || []).map((row, idx) => (
                <tr key={idx} className="border-t">
                  {['itemName','condition','measurementRange','acceptanceRange','result','remark'].map(col => (
                    <td key={col} className="p-2 align-top">
                      <input className="w-full border rounded px-2 py-1" value={row[col] || ''} onChange={(e)=>update(['specimenData','items', idx, col], e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h3 className="font-semibold mb-2">Reporting Results</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-right">no</th>
                <th className="p-2 text-right">itemName</th>
                <th className="p-2 text-right">condition</th>
                <th className="p-2 text-right">measurementRange</th>
                <th className="p-2 text-right">acceptanceRange</th>
                <th className="p-2 text-right">result</th>
                <th className="p-2 text-right">remark</th>
              </tr>
            </thead>
            <tbody>
              {(data.reportingResults || []).map((row, idx) => (
                <tr key={idx} className="border-t">
                  {['no','itemName','condition','measurementRange','acceptanceRange','result','remark'].map(col => (
                    <td key={col} className="p-2 align-top">
                      <input className="w-full border rounded px-2 py-1" value={row[col] || ''} onChange={(e)=>update(['reportingResults', idx, col], e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h3 className="font-semibold mb-2">Signature & Approval</h3>
        <div>
          <label className="block text-sm mb-1">comment</label>
          <input className="w-full border rounded px-3 py-2" value={data.comment || ''} onChange={(e)=>update(['comment'], e.target.value)} />
        </div>
        <UserSelectField label="testedBy" fa="Tested By" value={data.testedBy} onChange={(v)=>update(['testedBy'], v)} users={users} />
        <UserSelectField label="reviewedBy" fa="Reviewed By" value={data.reviewedBy} onChange={(v)=>update(['reviewedBy'], v)} users={users} />
        <UserSelectField label="approvedBy" fa="Approved By" value={data.approvedBy} onChange={(v)=>update(['approvedBy'], v)} users={users} />
      </section>
    </div>
  );
}

function UserSelectField({ label, fa, value, onChange, users }) {
  const safeUsers = Array.isArray(users)
    ? users
    : (Array.isArray(users?.rows)
      ? users.rows
      : (Array.isArray(users?.data)
        ? users.data
        : []));
  return (
    <div>
      <label className="block text-sm mb-1">{label} ({fa})</label>
      <select className="w-full border rounded px-3 py-2" value={value || ''} onChange={(e)=>onChange?.(e.target.value)}>
        <option value="">Select User</option>
        {safeUsers.map(u => (
          <option key={u.id} value={u.id}>{u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || u.email || u.mobile)}</option>
        ))}
      </select>
    </div>
  );
}

