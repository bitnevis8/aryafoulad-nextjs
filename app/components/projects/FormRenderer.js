"use client";
import { useState } from "react";

export default function FormRenderer({ template, value, onChange }) {
  const [data, setData] = useState(value || template.schema);

  const update = (path, v) => {
    const next = structuredClone(data);
    // naive path setter: path is array of keys
    let ref = next;
    for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
    ref[path[path.length - 1]] = v;
    setData(next);
    onChange?.(next);
  };

  const renderFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.keys(data.fields || {}).map((k) => (
        <div key={k}>
          <label className="block text-sm mb-1">{k}</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={data.fields[k] || ""} onChange={(e)=>update(["fields", k], e.target.value)} />
        </div>
      ))}
    </div>
  );

  const renderStandards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.keys(data.standards || {}).map((k) => (
        <label key={k} className="inline-flex items-center gap-2">
          <input type="checkbox" checked={!!data.standards[k]} onChange={(e)=>update(["standards", k], e.target.checked)} />
          <span>{k}</span>
        </label>
      ))}
    </div>
  );

  const renderStages = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.keys(data.inspectionStages || {}).map((k) => (
        <label key={k} className="inline-flex items-center gap-2">
          <input type="checkbox" checked={!!data.inspectionStages[k]} onChange={(e)=>update(["inspectionStages", k], e.target.checked)} />
          <span>{k}</span>
        </label>
      ))}
    </div>
  );

  const renderTypes = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 font-semibold bg-gray-50">
        <div>نوع</div><div>تعداد</div><div>بخش دستگاه</div><div>وضعیت</div>
      </div>
      {(data.inspectionTypes || []).map((row, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 border-t">
          <input className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500" value={row.type} onChange={(e)=>update(["inspectionTypes", idx, "type"], e.target.value)} />
          <input type="number" className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500" value={row["تعداد"]} onChange={(e)=>update(["inspectionTypes", idx, "تعداد"], Number(e.target.value))} />
          <input className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500" value={row["بخش_دستگاه"]} onChange={(e)=>update(["inspectionTypes", idx, "بخش_دستگاه"], e.target.value)} />
          <div className="text-gray-500">&nbsp;</div>
        </div>
      ))}
    </div>
  );

  const renderSign = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.keys(data.signSection || {}).map((k) => (
        <div key={k}>
          <label className="block text-sm mb-1">{k}</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={data.signSection[k] || ""} onChange={(e)=>update(["signSection", k], e.target.value)} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">{data.formTitle}</h2>
      {renderFields()}
      <section>
        <h3 className="font-semibold mb-2">استانداردها</h3>
        {renderStandards()}
      </section>
      <section>
        <h3 className="font-semibold mb-2">مراحل بازرسی</h3>
        {renderStages()}
      </section>
      <section>
        <h3 className="font-semibold mb-2">نوع بازرسی‌ها</h3>
        {renderTypes()}
      </section>
      <section>
        <h3 className="font-semibold mb-2">امضاء</h3>
        {renderSign()}
      </section>
    </div>
  );
}

