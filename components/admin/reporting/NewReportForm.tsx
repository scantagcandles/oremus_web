"use client";

import React, { useState } from "react";
import { useReporting } from "@/hooks/useReporting";
import { ReportType } from "@/types/analytics";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/glass/Button";

interface NewReportFormProps {
  onCreated: () => void;
}

const NewReportForm: React.FC<NewReportFormProps> = ({ onCreated }) => {
  const { createReportConfig, isLoading } = useReporting();
  const [formData, setFormData] = useState({
    name: "",
    type: "payment" as ReportType,
    schedule: "",
    query: "",
    recipients: [] as string[],
    parameters: {} as Record<string, any>,
  });
  const [recipient, setRecipient] = useState("");
  const [paramName, setParamName] = useState("");
  const [paramValue, setParamValue] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const addRecipient = () => {
    if (recipient && !formData.recipients.includes(recipient)) {
      setFormData({
        ...formData,
        recipients: [...formData.recipients, recipient],
      });
      setRecipient("");
    }
  };

  const removeRecipient = (email: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter((r) => r !== email),
    });
  };

  const addParameter = () => {
    if (paramName && paramValue) {
      setFormData({
        ...formData,
        parameters: {
          ...formData.parameters,
          [paramName]: paramValue,
        },
      });
      setParamName("");
      setParamValue("");
    }
  };

  const removeParameter = (key: string) => {
    const newParams = { ...formData.parameters };
    delete newParams[key];
    setFormData({
      ...formData,
      parameters: newParams,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReportConfig(formData);
      onCreated();
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Report</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Report Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Report Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg"
          >
            <option value="payment">Payment</option>
            <option value="course">Course</option>
            <option value="user">User</option>
            <option value="webhook">Webhook</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="schedule"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Schedule (Optional)
          </label>
          <select
            id="schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">No Schedule (On Demand)</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="query"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SQL Query
          </label>
          <textarea
            id="query"
            name="query"
            value={formData.query}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg h-32 font-mono text-sm"
            placeholder="SELECT * FROM table WHERE date BETWEEN '{start_date}' AND '{end_date}'"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {"{parameter_name}"} for dynamic parameters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parameters
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={paramName}
              onChange={(e) => setParamName(e.target.value)}
              placeholder="Parameter name"
              className="flex-1 p-2 border rounded-lg"
            />
            <input
              type="text"
              value={paramValue}
              onChange={(e) => setParamValue(e.target.value)}
              placeholder="Default value"
              className="flex-1 p-2 border rounded-lg"
            />
            <Button type="button" onClick={addParameter} className="px-3 py-1">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {Object.entries(formData.parameters).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="font-medium">{key}</span>: {value}
                </div>
                <button
                  type="button"
                  onClick={() => removeParameter(key)}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Recipients
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Email address"
              className="flex-1 p-2 border rounded-lg"
            />
            <Button type="button" onClick={addRecipient} className="px-3 py-1">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {formData.recipients.map((email) => (
              <div
                key={email}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
              >
                <div>{email}</div>
                <button
                  type="button"
                  onClick={() => removeRecipient(email)}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="px-4 py-2">
            {isLoading ? "Creating..." : "Create Report"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
};

export default NewReportForm;
