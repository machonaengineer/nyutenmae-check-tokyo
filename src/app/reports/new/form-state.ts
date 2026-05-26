import type { ReportFormErrors, ReportFormSnapshot } from "@/lib/report-form";

export type ReportFormState = {
  status: "idle" | "error";
  message?: string;
  errors: ReportFormErrors;
  values: ReportFormSnapshot;
};

export const initialReportFormState: ReportFormState = {
  status: "idle",
  errors: {},
  values: {},
};

export function createInitialReportFormState(
  values: ReportFormSnapshot = {},
): ReportFormState {
  return {
    status: "idle",
    errors: {},
    values,
  };
}
