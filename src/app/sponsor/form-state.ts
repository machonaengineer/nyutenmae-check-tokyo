import type {
  SponsorInquiryErrors,
  SponsorInquirySnapshot,
} from "@/lib/sponsor-inquiry";

export type SponsorInquiryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors: SponsorInquiryErrors;
  values: SponsorInquirySnapshot;
};

export function createInitialSponsorInquiryFormState(
  values: Partial<SponsorInquirySnapshot> = {},
): SponsorInquiryFormState {
  return {
    status: "idle",
    errors: {},
    values: {
      organization_name: "",
      contact_name: "",
      contact_email: "",
      website_url: "",
      sponsor_type: "sponsor",
      budget_range: "undecided",
      message: "",
      ...values,
    },
  };
}
