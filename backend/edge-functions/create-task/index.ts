// LearnLynk Tech Test - Task 3: Edge Function create-task

// Deno + Supabase Edge Functions style
// Docs reference: https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type CreateTaskPayload = {
  application_id: string;
  task_type: string;
  due_at: string;
};

const VALID_TYPES = ["call", "email", "review"];

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Partial<CreateTaskPayload>;
    const { application_id, task_type, due_at } = body;

    // Validation: check required fields
    if (!application_id || !task_type || !due_at) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          required: ["application_id", "task_type", "due_at"]
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validation: check task_type is valid
    if (!VALID_TYPES.includes(task_type)) {
      return new Response(
        JSON.stringify({
          error: "Invalid task_type",
          allowed: VALID_TYPES
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validation: parse and check due_at is valid and in the future
    const dueAtDate = new Date(due_at);
    if (isNaN(dueAtDate.getTime())) {
      return new Response(
        JSON.stringify({ error: "Invalid due_at timestamp" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    if (dueAtDate <= now) {
      return new Response(
        JSON.stringify({ error: "due_at must be in the future" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert into tasks table
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        application_id,
        type: task_type,
        due_at,
        status: "open", // Default status
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create task", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, task_id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
