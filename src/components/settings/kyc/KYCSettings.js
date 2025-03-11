"use client";

import { useState } from "react";

const initialFields = [
  { id: "firstName", label: "First Name", type: "text", required: true, enabled: true },
  { id: "lastName", label: "Last Name", type: "text", required: true, enabled: true },
  { id: "identityNumber", label: "Identity Number", type: "text", required: true, enabled: true },
  { id: "email", label: "Email Address", type: "email", required: true, enabled: true },
  { id: "address", label: "Address", type: "text", required: false, enabled: true },
  { id: "dob", label: "Date of Birth", type: "date", required: false, enabled: true },
  { id: "profilePicture", label: "Profile Picture", type: "file", required: false, enabled: true },
];

export default function KYCSettings() {
  const [fields, setFields] = useState(initialFields);

  const toggleField = (id, key) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, [key]: !field[key] } : field
    ));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">KYC Settings</h2>
      <p className="text-gray-500 text-sm mb-6">Configure the required fields for identity verification</p>

      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-6 border border-gray-200">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50/50 shadow-sm hover:shadow-md transition">
            <div>
              <p className="text-lg font-semibold text-gray-700">{field.label}</p>
              <p className="text-gray-500 text-sm">{field.type}</p>
            </div>
            <div className="flex items-center gap-6">
              {/* Required Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Required</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={field.required}
                    onChange={() => toggleField(field.id, "required")}
                  />
                  <div className="w-12 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 
                    rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white 
                    after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 
                    after:transition-all peer-checked:bg-blue-500">
                  </div>
                </label>
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Enabled</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={field.enabled}
                    onChange={() => toggleField(field.id, "enabled")}
                  />
                  <div className="w-12 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 
                    rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white 
                    after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 
                    after:transition-all peer-checked:bg-green-500">
                  </div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
