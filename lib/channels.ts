import { ContactChannel } from "./types";

// The 7 real intake channels through which a Mediacorp viewer, listener,
// advertiser, or press contact can reach support - distinct from the
// business queue (meWATCH / Broadcast / Advertiser / Corporate) a ticket
// belongs to. Singapore social reality: WhatsApp Business already carries
// ~40% of SG customer service inquiries (87% penetration), Instagram skews
// young (relevant to meWATCH's audience), Facebook still reaches ~79%.
// Icons are short monograms (not colour emoji) so every accent stays
// strictly within the app's blue/black/green palette - no brand pink/red.

export const CONTACT_CHANNELS: ContactChannel[] = [
  "WhatsApp Business",
  "Instagram DM",
  "Facebook Messenger",
  "X (Twitter)",
  "Phone",
  "Email",
  "Web Help Centre",
];

export interface ContactChannelMeta {
  icon: string;
  color: string;
  description: string;
}

export const CONTACT_CHANNEL_META: Record<ContactChannel, ContactChannelMeta> = {
  "WhatsApp Business": {
    icon: "WA",
    color: "#10b981", // mc.green - WhatsApp's own brand color happens to fit our palette
    description: "WhatsApp Business - ~87% SG penetration, carries roughly 40% of SG support inquiries",
  },
  "Instagram DM": {
    icon: "IG",
    color: "#22d3ee", // mc.cyan
    description: "Instagram Direct Message - strong reach with meWATCH's 18-34 audience",
  },
  "Facebook Messenger": {
    icon: "FB",
    color: "#3b82f6", // mc.blue
    description: "Facebook Messenger via facebook.com/mediacorp.singapore - ~79% SG reach",
  },
  "X (Twitter)": {
    icon: "X",
    color: "#64748b", // mc.slate
    description: "X (formerly Twitter) - public replies and DMs",
  },
  Phone: {
    icon: "PH",
    color: "#1d4ed8", // mc.blueDeep
    description: "Phone - +65 6333 3888, daily 8:30am - 1am",
  },
  Email: {
    icon: "EM",
    color: "#22d3ee", // mc.cyan
    description: "Email - tellmediacorpdigital@mediacorp.com.sg",
  },
  "Web Help Centre": {
    icon: "WEB",
    color: "#059669", // mc.greenDeep
    description: "meWatch Help Centre - web self-service form",
  },
};
