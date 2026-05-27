"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MODEL_PROVIDERS, MODEL_OPTIONS, DEFAULT_MODEL, DEFAULT_PROVIDER } from "@/lib/constants";
import type { Agent } from "@/types/database";

interface AgentFormProps {
  agent?: Agent;
  onSubmit: (data: AgentFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface AgentFormData {
  name: string;
  description: string;
  model_provider: string;
  model_name: string;
  system_prompt: string;
}

export function AgentForm({ agent, onSubmit, isLoading }: AgentFormProps) {
  const [name, setName] = useState(agent?.name || "");
  const [description, setDescription] = useState(agent?.description || "");
  const [modelProvider, setModelProvider] = useState(agent?.model_provider || DEFAULT_PROVIDER);
  const [modelName, setModelName] = useState(agent?.model_name || DEFAULT_MODEL);
  const [systemPrompt, setSystemPrompt] = useState(
    agent?.system_prompt || 
    "You are a helpful AI assistant. You can help users with various tasks including answering questions, writing, analysis, coding, and more."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      description,
      model_provider: modelProvider,
      model_name: modelName,
      system_prompt: systemPrompt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Agent Name"
        placeholder="My AI Assistant"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        label="Description"
        placeholder="A brief description of what this agent does"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Model Provider"
          value={modelProvider}
          onChange={(e) => {
            setModelProvider(e.target.value);
            const options = MODEL_OPTIONS[e.target.value];
            if (options && options.length > 0) {
              setModelName(options[0].value);
            }
          }}
          options={MODEL_PROVIDERS.map(p => ({ value: p.value, label: p.label }))}
        />

        <Select
          label="Model"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          options={MODEL_OPTIONS[modelProvider] || []}
        />
      </div>

      <Textarea
        label="System Prompt"
        placeholder="Instructions for how the agent should behave..."
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        className="min-h-[200px]"
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
        </Button>
      </div>
    </form>
  );
}