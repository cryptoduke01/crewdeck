// Analytics client for Mixpanel
import mixpanel from "mixpanel-browser";

class AnalyticsClient {
  private initialized = false;

  constructor() {
    if (typeof window === "undefined") return;

    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

    if (token && token !== "your_mixpanel_token") {
      try {
        mixpanel.init(token, {
          debug: process.env.NODE_ENV === "development",
          track_pageview: true,
          persistence: "localStorage",
        });
        this.initialized = true;
      } catch (error) {
        console.warn("Mixpanel initialization failed:", error);
      }
    }
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.initialized || typeof window === "undefined") {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics]", event, properties);
      }
      return;
    }

    try {
      mixpanel.track(event, properties);
    } catch (error) {
      console.error("Analytics track error:", error);
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!this.initialized || typeof window === "undefined") {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Identify", userId, traits);
      }
      return;
    }

    try {
      mixpanel.identify(userId);
      if (traits) {
        mixpanel.people.set(traits);
      }
    } catch (error) {
      console.error("Analytics identify error:", error);
    }
  }

  page(name: string, properties?: Record<string, any>) {
    if (!this.initialized || typeof window === "undefined") {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Page", name, properties);
      }
      return;
    }

    try {
      mixpanel.track("Page View", {
        page: name,
        ...properties,
      });
    } catch (error) {
      console.error("Analytics page error:", error);
    }
  }

  reset() {
    if (!this.initialized || typeof window === "undefined") return;

    try {
      mixpanel.reset();
    } catch (error) {
      console.error("Analytics reset error:", error);
    }
  }
}

export const analytics = new AnalyticsClient();
