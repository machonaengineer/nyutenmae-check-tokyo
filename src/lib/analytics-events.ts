export const ANALYTICS_EVENTS = {
  quickReportCta: "quick_report_cta",
  fullReportCta: "full_report_cta",
  supportCta: "support_cta",
  guideCta: "guide_cta",
  socialTemplateCta: "social_template_cta",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
