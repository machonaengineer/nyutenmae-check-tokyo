import type { ObjectionFormErrors, ObjectionFormSnapshot } from "@/lib/objection-form";

export type ObjectionFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors: ObjectionFormErrors;
  values: ObjectionFormSnapshot;
};

export function createInitialObjectionFormState(
  values: Partial<ObjectionFormSnapshot> = {},
): ObjectionFormState {
  return {
    status: "idle",
    errors: {},
    values: {
      report_id: "",
      target_url: "",
      requester_name: "",
      requester_email: "",
      requester_relationship: "",
      reason_category: "fact_check",
      details: "",
      supplemental_note: "",
      ...values,
    },
  };
}
