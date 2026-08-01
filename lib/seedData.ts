import { Organization, Contact, Engagement, Ticket, Task, Note } from "./types";
import { phaseForStage } from "./engagementMeta";

// Mediacorp is Singapore's national media network - TV (Channel 5, 8, U,
// Suria, Vasantham, CNA), radio (Class 95FM, Gold 905FM, Capital 958FM,
// YES 933FM, Love 972FM, CNA938), digital (meWATCH, meLISTEN, CNA.asia)
// and a DOOH out-of-home network - reaching ~99% of the population weekly
// across four languages. This seed data spans the real range of
// relationships a broadcaster like this manages: ad sales & agencies,
// content licensing/syndication, talent & production partners, event
// sponsorships, DOOH location partners, and audience/advertiser support
// tickets across real Mediacorp support channels.

const day = (offset: number) => {
  const d = new Date("2026-07-31T09:00:00Z");
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};

export const seedOrganizations: Organization[] = [
  // Agencies
  { id: "co_groupm", name: "GroupM Singapore", category: "Agency", industry: "Media Agency", hqCity: "Singapore", website: "groupm.com", createdAt: day(-260) },
  { id: "co_dentsu", name: "Dentsu Singapore (Carat)", category: "Agency", industry: "Media Agency", hqCity: "Singapore", website: "dentsu.com", createdAt: day(-260) },
  { id: "co_ipgmb", name: "IPG Mediabrands Singapore", category: "Agency", industry: "Media Agency", hqCity: "Singapore", website: "ipgmediabrands.com", createdAt: day(-258) },
  { id: "co_zenith", name: "Zenith (Publicis Media)", category: "Agency", industry: "Media Agency", hqCity: "Singapore", website: "publicismedia.com", createdAt: day(-258) },
  { id: "co_wavemaker", name: "Wavemaker Singapore", category: "Agency", industry: "Media Agency", hqCity: "Singapore", website: "wavemakerglobal.com", createdAt: day(-240) },
  { id: "co_omd", name: "OMD Singapore", category: "Agency", industry: "Media Agency", hqCity: "Singapore", website: "omd.com", createdAt: day(-240) },

  // Advertisers
  { id: "co_unilever", name: "Unilever Singapore", category: "Advertiser", industry: "FMCG", hqCity: "Singapore", website: "unilever.com.sg", agencyOfRecord: "Mindshare (GroupM Singapore)", createdAt: day(-250) },
  { id: "co_pg", name: "Procter & Gamble", category: "Advertiser", industry: "FMCG", hqCity: "Singapore", website: "pg.com", agencyOfRecord: "Wavemaker Singapore", createdAt: day(-248) },
  { id: "co_dbs", name: "DBS Bank", category: "Advertiser", industry: "Banking & Finance", hqCity: "Singapore", website: "dbs.com", agencyOfRecord: "Zenith (Publicis Media)", createdAt: day(-245) },
  { id: "co_singtel", name: "Singtel", category: "Advertiser", industry: "Telecommunications", hqCity: "Singapore", website: "singtel.com", agencyOfRecord: "Dentsu Singapore (Carat)", createdAt: day(-242) },
  { id: "co_shopee", name: "Shopee", category: "Advertiser", industry: "E-commerce", hqCity: "Singapore", website: "shopee.sg", agencyOfRecord: "GroupM Singapore", createdAt: day(-238) },
  { id: "co_grab", name: "Grab", category: "Advertiser", industry: "Technology / Super App", hqCity: "Singapore", website: "grab.com", agencyOfRecord: "IPG Mediabrands Singapore", createdAt: day(-235) },
  { id: "co_fairprice", name: "NTUC FairPrice", category: "Advertiser", industry: "Retail", hqCity: "Singapore", website: "fairprice.com.sg", agencyOfRecord: "OMD Singapore", createdAt: day(-200) },
  { id: "co_nike", name: "Nike Singapore", category: "Advertiser", industry: "Apparel & Footwear", hqCity: "Singapore", website: "nike.com", agencyOfRecord: "Zenith (Publicis Media)", createdAt: day(-190) },
  { id: "co_samsung", name: "Samsung Electronics Singapore", category: "Advertiser", industry: "Consumer Electronics", hqCity: "Singapore", website: "samsung.com/sg", agencyOfRecord: "Dentsu Singapore (Carat)", createdAt: day(-175) },
  { id: "co_greateastern", name: "Great Eastern Life", category: "Advertiser", industry: "Insurance", hqCity: "Singapore", website: "greateasternlife.com", agencyOfRecord: "GroupM Singapore", createdAt: day(-160) },

  // Content distributors - inbound (licensing content INTO meWATCH) and
  // outbound (syndicating Mediacorp originals to regional broadcasters)
  { id: "co_cjenm", name: "CJ ENM (Korea)", category: "Distributor", industry: "Content Distribution - Korean Drama", hqCity: "Seoul", website: "cjenm.com", createdAt: day(-220) },
  { id: "co_globalagency", name: "Global Agency (Turkey)", category: "Distributor", industry: "Content Distribution - Turkish Drama", hqCity: "Istanbul", website: "globalagency.tv", createdAt: day(-180) },
  { id: "co_beyond", name: "Beyond Distribution", category: "Distributor", industry: "Content Distribution - Factual/Lifestyle", hqCity: "Sydney", website: "beyond.com.au", createdAt: day(-150) },
  { id: "co_astro", name: "Astro Malaysia", category: "Distributor", industry: "Regional Broadcaster - Syndication Partner", hqCity: "Kuala Lumpur", website: "astro.com.my", createdAt: day(-210) },
  { id: "co_gma", name: "GMA Network (Philippines)", category: "Distributor", industry: "Regional Broadcaster - Syndication Partner", hqCity: "Manila", website: "gmanetwork.com", createdAt: day(-140) },
  { id: "co_viu", name: "Viu Asia", category: "Distributor", industry: "Regional OTT - Syndication Partner", hqCity: "Hong Kong", website: "viu.com", createdAt: day(-130) },

  // Talent agencies & production houses
  { id: "co_leftprofile", name: "Left Profile Management", category: "TalentAgency", industry: "Artiste Management", hqCity: "Singapore", website: "leftprofile.sg", createdAt: day(-200) },
  { id: "co_vertex", name: "Vertex Talent Management", category: "TalentAgency", industry: "Artiste Management", hqCity: "Singapore", website: "vertextalent.sg", createdAt: day(-180) },
  { id: "co_beachhouse", name: "Beach House Pictures", category: "ProductionHouse", industry: "Independent Production - Factual/Lifestyle", hqCity: "Singapore", website: "beachhousepix.com", createdAt: day(-230) },
  { id: "co_akanga", name: "Akanga Film Asia", category: "ProductionHouse", industry: "Independent Production - Documentary/Drama", hqCity: "Singapore", website: "akangafilmasia.com", createdAt: day(-210) },
  { id: "co_tigerpeak", name: "Tiger Peak Studios", category: "ProductionHouse", industry: "Independent Production - Variety/Digital", hqCity: "Singapore", website: "tigerpeakstudios.sg", createdAt: day(-120) },

  // Event sponsors (brand-side, distinct from always-on ad campaign clients)
  { id: "co_toyota", name: "Toyota Singapore", category: "Sponsor", industry: "Automotive", hqCity: "Singapore", website: "toyota.com.sg", createdAt: day(-100) },
  { id: "co_starhub", name: "StarHub", category: "Sponsor", industry: "Telecommunications", hqCity: "Singapore", website: "starhub.com", createdAt: day(-100) },

  // DOOH location partners
  { id: "co_capitaland", name: "CapitaLand", category: "LocationPartner", industry: "Mall Operator", hqCity: "Singapore", website: "capitaland.com", createdAt: day(-300) },
  { id: "co_frasers", name: "Frasers Property", category: "LocationPartner", industry: "Mall / Residential Operator", hqCity: "Singapore", website: "frasersproperty.com", createdAt: day(-290) },
  { id: "co_smrtmedia", name: "SMRT Media", category: "LocationPartner", industry: "Transit Media Operator", hqCity: "Singapore", website: "smrt.com.sg", createdAt: day(-280) },
  { id: "co_comfortdelgro", name: "ComfortDelGro", category: "LocationPartner", industry: "Transit Media Operator (Bus/Taxi)", hqCity: "Singapore", website: "comfortdelgro.com", createdAt: day(-270) },
];

export const seedContacts: Contact[] = [
  { id: "ct_1", orgId: "co_unilever", name: "Rachel Tan", title: "Head of Media & Digital", email: "rachel.tan@unilever.com.sg", phone: "+65 9123 4501", isTalent: false, createdAt: day(-250) },
  { id: "ct_2", orgId: "co_pg", name: "Marcus Lim", title: "Brand Media Manager", email: "marcus.lim@pg.com", phone: "+65 9123 4502", isTalent: false, createdAt: day(-248) },
  { id: "ct_3", orgId: "co_dbs", name: "Priya Sharma", title: "VP, Marketing Communications", email: "priya.sharma@dbs.com", phone: "+65 9123 4503", isTalent: false, createdAt: day(-245) },
  { id: "ct_4", orgId: "co_singtel", name: "Jonathan Ng", title: "Senior Manager, Brand Marketing", email: "jonathan.ng@singtel.com", phone: "+65 9123 4504", isTalent: false, createdAt: day(-242) },
  { id: "ct_5", orgId: "co_shopee", name: "Wei Ling Koh", title: "Regional Media Lead", email: "weiling.koh@shopee.sg", phone: "+65 9123 4505", isTalent: false, createdAt: day(-238) },
  { id: "ct_6", orgId: "co_grab", name: "Aaron Teo", title: "Head of Brand Partnerships", email: "aaron.teo@grab.com", phone: "+65 9123 4506", isTalent: false, createdAt: day(-235) },
  { id: "ct_7", orgId: "co_fairprice", name: "Siti Rahman", title: "Marketing Director", email: "siti.rahman@fairprice.com.sg", phone: "+65 9123 4507", isTalent: false, createdAt: day(-200) },
  { id: "ct_8", orgId: "co_nike", name: "David Ong", title: "Marketing Manager, SEA", email: "david.ong@nike.com", phone: "+65 9123 4508", isTalent: false, createdAt: day(-190) },
  { id: "ct_9", orgId: "co_samsung", name: "Grace Kim", title: "Head of Marketing, Singapore", email: "grace.kim@samsung.com", phone: "+65 9123 4509", isTalent: false, createdAt: day(-175) },
  { id: "ct_10", orgId: "co_greateastern", name: "Benjamin Chua", title: "AVP, Brand & Marketing", email: "benjamin.chua@greateasternlife.com", phone: "+65 9123 4510", isTalent: false, createdAt: day(-160) },

  { id: "ct_a1", orgId: "co_groupm", name: "Sarah Lee", title: "Business Director", email: "sarah.lee@groupm.com", phone: "+65 8123 1001", isTalent: false, createdAt: day(-260) },
  { id: "ct_a2", orgId: "co_dentsu", name: "Kevin Goh", title: "Client Lead", email: "kevin.goh@dentsu.com", phone: "+65 8123 1002", isTalent: false, createdAt: day(-260) },
  { id: "ct_a3", orgId: "co_ipgmb", name: "Michelle Wong", title: "Account Director", email: "michelle.wong@ipgmediabrands.com", phone: "+65 8123 1003", isTalent: false, createdAt: day(-258) },
  { id: "ct_a4", orgId: "co_zenith", name: "Farhan Ismail", title: "Planning Director", email: "farhan.ismail@publicismedia.com", phone: "+65 8123 1004", isTalent: false, createdAt: day(-258) },

  { id: "ct_d1", orgId: "co_cjenm", name: "Soo-jin Park", title: "International Sales Manager", email: "soojin.park@cjenm.com", phone: "+82 2 1234 5601", isTalent: false, createdAt: day(-220) },
  { id: "ct_d2", orgId: "co_globalagency", name: "Emre Yildiz", title: "SEA Sales Director", email: "emre.yildiz@globalagency.tv", phone: "+90 212 123 4501", isTalent: false, createdAt: day(-180) },
  { id: "ct_d3", orgId: "co_beyond", name: "Charlotte Hayes", title: "Head of Content Sales, APAC", email: "charlotte.hayes@beyond.com.au", phone: "+61 2 8123 4501", isTalent: false, createdAt: day(-150) },
  { id: "ct_d4", orgId: "co_astro", name: "Nurul Aini", title: "Acquisitions Manager", email: "nurul.aini@astro.com.my", phone: "+60 3 7123 4501", isTalent: false, createdAt: day(-210) },
  { id: "ct_d5", orgId: "co_gma", name: "Carlo Reyes", title: "VP International Relations", email: "carlo.reyes@gmanetwork.com", phone: "+63 2 8123 4501", isTalent: false, createdAt: day(-140) },
  { id: "ct_d6", orgId: "co_viu", name: "Janice Fung", title: "Content Partnerships Lead", email: "janice.fung@viu.com", phone: "+852 3123 4501", isTalent: false, createdAt: day(-130) },

  { id: "ct_t1", orgId: "co_leftprofile", name: "Marcus Teo", title: "Host / Emcee", email: "marcus.teo@leftprofile.sg", phone: "+65 9234 5601", isTalent: true, talentType: "Host", createdAt: day(-200) },
  { id: "ct_t2", orgId: "co_vertex", name: "Priya Devan", title: "Actor", email: "priya.devan@vertextalent.sg", phone: "+65 9234 5602", isTalent: true, talentType: "Actor", createdAt: day(-180) },
  { id: "ct_t3", orgId: "co_leftprofile", name: "Ryan Lim", title: "Radio DJ", email: "ryan.lim@leftprofile.sg", phone: "+65 9234 5603", isTalent: true, talentType: "DJ", createdAt: day(-170) },
  { id: "ct_t4", orgId: "co_vertex", name: "Aisha Rahman", title: "Presenter", email: "aisha.rahman@vertextalent.sg", phone: "+65 9234 5604", isTalent: true, talentType: "Presenter", createdAt: day(-160) },
  { id: "ct_t5", orgId: "co_leftprofile", name: "Kenneth Wu", title: "Actor", email: "kenneth.wu@leftprofile.sg", phone: "+65 9234 5605", isTalent: true, talentType: "Actor", createdAt: day(-150) },

  { id: "ct_p1", orgId: "co_beachhouse", name: "Damien Koh", title: "Executive Producer", email: "damien.koh@beachhousepix.com", phone: "+65 9345 6701", isTalent: false, createdAt: day(-230) },
  { id: "ct_p2", orgId: "co_akanga", name: "Lynette Chua", title: "Producer", email: "lynette.chua@akangafilmasia.com", phone: "+65 9345 6702", isTalent: false, createdAt: day(-210) },

  { id: "ct_l1", orgId: "co_capitaland", name: "Wilson Ho", title: "Media & Sponsorship Manager", email: "wilson.ho@capitaland.com", phone: "+65 9456 7801", isTalent: false, createdAt: day(-300) },
  { id: "ct_l2", orgId: "co_frasers", name: "Amanda Seah", title: "Marketing Partnerships Lead", email: "amanda.seah@frasersproperty.com", phone: "+65 9456 7802", isTalent: false, createdAt: day(-290) },
  { id: "ct_l3", orgId: "co_smrtmedia", name: "Faizal Rashid", title: "Advertising Sales Manager", email: "faizal.rashid@smrt.com.sg", phone: "+65 9456 7803", isTalent: false, createdAt: day(-280) },
  { id: "ct_l4", orgId: "co_comfortdelgro", name: "Belinda Yeo", title: "Partnerships Manager", email: "belinda.yeo@comfortdelgro.com", phone: "+65 9456 7804", isTalent: false, createdAt: day(-270) },
];

function mkEngagement(e: Omit<Engagement, "phase">): Engagement {
  return { ...e, phase: phaseForStage(e.stage) };
}

export const seedEngagements: Engagement[] = [
  // --- Ad Campaigns (ad-ops vocabulary: avails, booked, makegoods live in notes) ---
  mkEngagement({ id: "eg_1", type: "AdCampaign", name: "Unilever - National Day Integrated Campaign", orgId: "co_unilever", secondaryOrgId: "co_groupm", stage: "Negotiation", valueSgd: 850000, startDate: day(10), endDate: day(45), properties: { campaignType: "Integrated", platforms: ["Channel 5", "Channel 8", "meWATCH", "Class 95FM"] }, owner: "Astha Mundhra", createdAt: day(-30), updatedAt: day(-2) }),
  mkEngagement({ id: "eg_2", type: "AdCampaign", name: "P&G Q4 FMCG Bundle - TV + Radio", orgId: "co_pg", secondaryOrgId: "co_wavemaker", stage: "Avails Shared", valueSgd: 420000, startDate: day(20), endDate: day(65), properties: { campaignType: "TV Spot", platforms: ["Channel 8", "Gold 905FM"] }, owner: "Astha Mundhra", createdAt: day(-20), updatedAt: day(-5) }),
  mkEngagement({ id: "eg_3", type: "AdCampaign", name: "DBS Digital Banking Push - meWATCH Pre-roll", orgId: "co_dbs", secondaryOrgId: "co_zenith", stage: "Make-Good or Renewal Review", valueSgd: 620000, startDate: day(-15), endDate: day(30), properties: { campaignType: "Digital Display", platforms: ["meWATCH", "CNA"] }, owner: "Astha Mundhra", createdAt: day(-60), updatedAt: day(-10) }),
  mkEngagement({ id: "eg_4", type: "AdCampaign", name: "Singtel 5G Brand Campaign", orgId: "co_singtel", secondaryOrgId: "co_dentsu", stage: "Negotiation", valueSgd: 1200000, startDate: day(15), endDate: day(90), properties: { campaignType: "Integrated", platforms: ["Channel 5", "CNA", "meWATCH", "DOOH Network"] }, owner: "Astha Mundhra", createdAt: day(-25), updatedAt: day(-1) }),
  mkEngagement({ id: "eg_5", type: "AdCampaign", name: "Shopee 11.11 Mega Sale Blitz", orgId: "co_shopee", secondaryOrgId: "co_groupm", stage: "Avails Shared", valueSgd: 950000, startDate: day(60), endDate: day(105), properties: { campaignType: "DOOH", platforms: ["DOOH Network", "meWATCH", "Class 95FM"] }, owner: "Daniel Yeo", createdAt: day(-5), updatedAt: day(-1) }),
  mkEngagement({ id: "eg_6", type: "AdCampaign", name: "Grab Super App Rebrand - Multi-platform", orgId: "co_grab", secondaryOrgId: "co_ipgmb", stage: "Avails Shared", valueSgd: 780000, startDate: day(30), endDate: day(75), properties: { campaignType: "Branded Content", platforms: ["Channel U", "meWATCH", "meLISTEN"] }, owner: "Astha Mundhra", createdAt: day(-14), updatedAt: day(-3) }),
  mkEngagement({ id: "eg_7", type: "AdCampaign", name: "NTUC FairPrice CNY Campaign - Suria/Vasantham", orgId: "co_fairprice", secondaryOrgId: "co_omd", stage: "Make-Good or Renewal Review", valueSgd: 310000, startDate: day(-40), endDate: day(-5), properties: { campaignType: "TV Spot", platforms: ["Suria", "Vasantham"] }, owner: "Daniel Yeo", createdAt: day(-70), updatedAt: day(-20) }),
  mkEngagement({ id: "eg_8", type: "AdCampaign", name: "Samsung Galaxy Launch - Integrated Roadblock", orgId: "co_samsung", secondaryOrgId: "co_dentsu", stage: "Insertion Order Signed", valueSgd: 1450000, startDate: day(5), endDate: day(40), properties: { campaignType: "Integrated", platforms: ["Channel 5", "Channel 8", "meWATCH", "CNA", "DOOH Network"] }, owner: "Astha Mundhra", createdAt: day(-35), updatedAt: day(-1) }),
  mkEngagement({ id: "eg_9", type: "AdCampaign", name: "Great Eastern Life - Financial Wellness Series", orgId: "co_greateastern", secondaryOrgId: "co_groupm", stage: "Make-Good or Renewal Review", valueSgd: 280000, startDate: day(-50), endDate: day(-10), properties: { campaignType: "Branded Content", platforms: ["CNA", "Class 95FM"] }, owner: "Daniel Yeo", createdAt: day(-80), updatedAt: day(-40) }),

  // --- Content Licensing & Syndication ---
  mkEngagement({ id: "eg_10", type: "ContentLicensing", name: "\"Crash Landing Again\" - meWATCH Korean Drama License", orgId: "co_cjenm", stage: "Terms & Territory Negotiation", valueSgd: 380000, startDate: day(45), endDate: day(410), properties: { direction: "Inbound", contentTitle: "Crash Landing Again", territory: "Singapore (meWATCH exclusive)", genre: "Korean Drama" }, owner: "Astha Mundhra", createdAt: day(-18), updatedAt: day(-2) }),
  mkEngagement({ id: "eg_11", type: "ContentLicensing", name: "Turkish Drama Package - 3 Titles for meWATCH", orgId: "co_globalagency", stage: "Contract Drafting", valueSgd: 210000, startDate: day(30), endDate: day(395), properties: { direction: "Inbound", contentTitle: "Bundle: 3 Turkish drama titles", territory: "Singapore, Malaysia (meWATCH)", genre: "Turkish Drama" }, owner: "Astha Mundhra", createdAt: day(-25), updatedAt: day(-4) }),
  mkEngagement({ id: "eg_12", type: "ContentLicensing", name: "\"The Golden Pinnacle\" - Syndication to Astro Malaysia", orgId: "co_astro", stage: "Live on Platform", valueSgd: 150000, startDate: day(-10), endDate: day(355), properties: { direction: "Outbound", contentTitle: "The Golden Pinnacle", territory: "Malaysia", genre: "Chinese Drama" }, owner: "Astha Mundhra", createdAt: day(-45), updatedAt: day(-8) }),
  mkEngagement({ id: "eg_13", type: "ContentLicensing", name: "Factual Format Deal - Beyond Distribution", orgId: "co_beyond", stage: "Rights Inquiry", valueSgd: 95000, startDate: day(70), endDate: day(435), properties: { direction: "Inbound", contentTitle: "Lifestyle/factual format package", territory: "Singapore (meWATCH)", genre: "Factual / Lifestyle" }, owner: "Astha Mundhra", createdAt: day(-6), updatedAt: day(-1) }),
  mkEngagement({ id: "eg_14", type: "ContentLicensing", name: "\"Titoudao\" Format Sale - GMA Network", orgId: "co_gma", stage: "Terms & Territory Negotiation", valueSgd: 120000, startDate: day(90), endDate: day(455), properties: { direction: "Outbound", contentTitle: "Titoudao (format adaptation rights)", territory: "Philippines", genre: "Drama Format" }, owner: "Astha Mundhra", createdAt: day(-15), updatedAt: day(-3) }),
  mkEngagement({ id: "eg_15", type: "ContentLicensing", name: "meWATCH Originals Bundle - Viu Asia", orgId: "co_viu", stage: "Live on Platform", valueSgd: 175000, startDate: day(-60), endDate: day(305), properties: { direction: "Outbound", contentTitle: "Bundle: 5 meWATCH originals", territory: "Hong Kong, Indonesia, Philippines", genre: "Mixed" }, owner: "Astha Mundhra", createdAt: day(-90), updatedAt: day(-12) }),

  // --- Talent & Production Bookings ---
  mkEngagement({ id: "eg_16", type: "TalentBooking", name: "Marcus Teo - National Day Parade Telecast Host", orgId: "co_leftprofile", contactId: "ct_t1", stage: "Contract Signed", valueSgd: 28000, startDate: day(5), endDate: day(5), properties: { production: "National Day Parade Telecast", role: "Host" }, owner: "Astha Mundhra", createdAt: day(-40), updatedAt: day(-5) }),
  mkEngagement({ id: "eg_17", type: "TalentBooking", name: "Priya Devan - Vasantham Drama Lead", orgId: "co_vertex", contactId: "ct_t2", stage: "Terms & Exclusivity Negotiation", valueSgd: 65000, startDate: day(20), endDate: day(110), properties: { production: "Vasantham drama series (Q4 slate)", role: "Lead Actor" }, owner: "Astha Mundhra", createdAt: day(-12), updatedAt: day(-2) }),
  mkEngagement({ id: "eg_18", type: "TalentBooking", name: "Ryan Lim - Class 95FM Breakfast Show Renewal", orgId: "co_leftprofile", contactId: "ct_t3", stage: "Terms & Exclusivity Negotiation", valueSgd: 42000, startDate: day(30), endDate: day(395), properties: { production: "Class 95FM Breakfast Show", role: "DJ / Co-host" }, owner: "Astha Mundhra", createdAt: day(-8), updatedAt: day(-1) }),
  mkEngagement({ id: "eg_19", type: "TalentBooking", name: "Aisha Rahman - Star Awards Red Carpet Presenter", orgId: "co_vertex", contactId: "ct_t4", stage: "Contract Signed", valueSgd: 15000, startDate: day(12), endDate: day(12), properties: { production: "Star Awards 2026", role: "Red Carpet Presenter" }, owner: "Astha Mundhra", createdAt: day(-20), updatedAt: day(-3) }),
  mkEngagement({ id: "eg_20", type: "TalentBooking", name: "Kenneth Wu - Channel 8 Drama, Recast Inquiry", orgId: "co_leftprofile", contactId: "ct_t5", stage: "Booking Request", valueSgd: 55000, startDate: day(60), endDate: day(150), properties: { production: "Channel 8 drama (working title: Harbour Lights)", role: "Supporting Actor" }, owner: "Astha Mundhra", createdAt: day(-3), updatedAt: day(-1) }),
  mkEngagement({ id: "eg_21", type: "TalentBooking", name: "Beach House Pictures - Factual Series Co-production", orgId: "co_beachhouse", contactId: "ct_p1", stage: "Contract Signed", valueSgd: 320000, startDate: day(25), endDate: day(200), properties: { production: "Regional factual co-production (working title: Street Eats Asia)", role: "Production Partner" }, owner: "Astha Mundhra", createdAt: day(-22), updatedAt: day(-4) }),

  // --- Sponsorship & Events ---
  mkEngagement({ id: "eg_22", type: "Sponsorship", name: "Toyota - Star Awards 2026 Presenting Sponsor", orgId: "co_toyota", stage: "Contract Signed", valueSgd: 680000, startDate: day(1), endDate: day(12), properties: { eventName: "Star Awards 2026", tier: "Presenting Sponsor" }, owner: "Astha Mundhra", createdAt: day(-50), updatedAt: day(-6) }),
  mkEngagement({ id: "eg_23", type: "Sponsorship", name: "StarHub - National Day Parade Telecast Sponsorship", orgId: "co_starhub", stage: "Activation / Event Live", valueSgd: 520000, startDate: day(-5), endDate: day(5), properties: { eventName: "National Day Parade Telecast 2026", tier: "Official Partner" }, owner: "Astha Mundhra", createdAt: day(-65), updatedAt: day(-2) }),
  mkEngagement({ id: "eg_24", type: "Sponsorship", name: "Samsung - meWATCH Music Festival Title Sponsor", orgId: "co_samsung", stage: "Proposal & Pricing", valueSgd: 400000, startDate: day(80), endDate: day(82), properties: { eventName: "meWATCH Music Festival", tier: "Title Sponsor" }, owner: "Astha Mundhra", createdAt: day(-10), updatedAt: day(-2) }),

  // --- DOOH Location Partnerships ---
  mkEngagement({ id: "eg_25", type: "DOOHPartnership", name: "CapitaLand Mall Network - Screen Renewal", orgId: "co_capitaland", stage: "Live / Airing", valueSgd: 240000, startDate: day(-100), endDate: day(265), properties: { venueName: "12 CapitaLand malls islandwide", screenCount: 48, revenueSharePct: 30, locationType: "Mall" }, owner: "Astha Mundhra", createdAt: day(-110), updatedAt: day(-15) }),
  mkEngagement({ id: "eg_26", type: "DOOHPartnership", name: "SMRT Media - MRT Platform Screens", orgId: "co_smrtmedia", stage: "Performance Review & Renewal", valueSgd: 310000, startDate: day(-350), endDate: day(15), properties: { venueName: "MRT platform + concourse screens, 6 interchange stations", screenCount: 90, revenueSharePct: 35, locationType: "Transit" }, owner: "Astha Mundhra", createdAt: day(-360), updatedAt: day(-5) }),
  mkEngagement({ id: "eg_27", type: "DOOHPartnership", name: "Frasers Property - Residential Lobby Screens", orgId: "co_frasers", stage: "Programmatic / Direct Terms", valueSgd: 85000, startDate: day(40), endDate: day(405), properties: { venueName: "18 condominium lobby screens", screenCount: 18, revenueSharePct: 25, locationType: "Residential" }, owner: "Astha Mundhra", createdAt: day(-9), updatedAt: day(-2) }),
  mkEngagement({ id: "eg_28", type: "DOOHPartnership", name: "ComfortDelGro - Taxi-top & Bus Shelter Screens", orgId: "co_comfortdelgro", stage: "Site Proposal", valueSgd: 190000, startDate: day(75), endDate: day(440), properties: { venueName: "Taxi-top displays + 40 bus shelters", screenCount: 140, revenueSharePct: 30, locationType: "Transit" }, owner: "Astha Mundhra", createdAt: day(-7), updatedAt: day(-1) }),
];

export const seedTickets: Ticket[] = [
  // meWATCH streaming
  {
    id: "tk_1", channel: "meWATCH", contactChannel: "Web Help Centre", category: "Playback / buffering", subject: "Buffering constantly during Crash Landing Again ep 4", body: "Video keeps buffering every 2-3 minutes on my Samsung Smart TV app, WiFi is fine for everything else.", requesterName: "Jasmine Koh", requesterContact: "jasmine.koh92@gmail.com", status: "Open", priority: "Medium", assignee: "Support Team A", createdAt: day(-2), updatedAt: day(-1),
    messages: [
      { id: "msg_tk1_1", author: "Jasmine Koh", direction: "inbound", channel: "Web Help Centre", body: "Video keeps buffering every 2-3 minutes on my Samsung Smart TV app, WiFi is fine for everything else.", createdAt: day(-2) },
      { id: "msg_tk1_2", author: "Support Team A", direction: "outbound", channel: "Web Help Centre", body: "Thanks for flagging this, Jasmine - we've identified a CDN routing issue affecting Samsung Smart TV devices and are pushing a fix. We'll update you once it's resolved.", createdAt: day(-1) },
    ],
  },
  {
    id: "tk_2", channel: "meWATCH", contactChannel: "WhatsApp Business", category: "Subscription billing", subject: "Charged twice for meWATCH Premium this month", body: "I see two SGD 9.98 charges on my card statement for meWATCH Premium on the same billing cycle.", requesterName: "Terence Ho", requesterContact: "+65 9812 7734", status: "New", priority: "High", assignee: "Unassigned", createdAt: day(-1), updatedAt: day(-1),
    messages: [
      { id: "msg_tk2_1", author: "Terence Ho", direction: "inbound", channel: "WhatsApp Business", body: "I see two SGD 9.98 charges on my card statement for meWATCH Premium on the same billing cycle.", createdAt: day(-1) },
      { id: "msg_tk2_2", author: "meWATCH Support", direction: "outbound", channel: "WhatsApp Business", body: "Hi Terence, thanks for the report - we've logged this and a support specialist will verify the duplicate charge with our payments processor within 24 hours.", createdAt: day(-1) },
    ],
  },
  {
    id: "tk_3", channel: "meWATCH", contactChannel: "Instagram DM", category: "Login & account", subject: "Can't log in after phone number change", body: "Changed my mobile number and now the OTP login flow doesn't recognise my account at all.", requesterName: "Farah Idris", requesterContact: "@farah.idris", status: "Pending", priority: "Medium", assignee: "Support Team B", createdAt: day(-4), updatedAt: day(-2),
    messages: [
      { id: "msg_tk3_1", author: "Farah Idris", direction: "inbound", channel: "Instagram DM", body: "Changed my mobile number and now the OTP login flow doesn't recognise my account at all.", createdAt: day(-4) },
      { id: "msg_tk3_2", author: "Support Team B", direction: "outbound", channel: "Instagram DM", body: "Hi Farah, thanks for the DM - could you confirm the last 4 digits of your previously registered mobile number so we can update your account securely?", createdAt: day(-2) },
    ],
  },
  {
    id: "tk_4", channel: "meWATCH", contactChannel: "Facebook Messenger", category: "Subtitle sync", subject: "Subtitles out of sync on Turkish drama titles", body: "On all 3 of the new Turkish drama episodes, subtitles run about 4 seconds ahead of the dialogue.", requesterName: "Grace Lim", requesterContact: "facebook.com/grace.lim88", status: "Open", priority: "Low", assignee: "Support Team A", createdAt: day(-3), updatedAt: day(-1),
    messages: [
      { id: "msg_tk4_1", author: "Grace Lim", direction: "inbound", channel: "Facebook Messenger", body: "On all 3 of the new Turkish drama episodes, subtitles run about 4 seconds ahead of the dialogue.", createdAt: day(-3) },
      { id: "msg_tk4_2", author: "Support Team A", direction: "outbound", channel: "Facebook Messenger", body: "Thanks Grace - we've flagged the timing offset to our subtitling vendor for the Turkish drama titles and are re-syncing the affected episodes.", createdAt: day(-1) },
    ],
  },

  // Broadcast (TV + Radio)
  {
    id: "tk_5", channel: "Broadcast", contactChannel: "X (Twitter)", category: "Song ID request", subject: "What was the song played on Class 95 at 8:15am today?", body: "Loved the track played right after the traffic update this morning, can you help identify it?", requesterName: "Ben Tan", requesterContact: "@ben_tan_sg", status: "New", priority: "Low", assignee: "Unassigned", createdAt: day(0), updatedAt: day(0),
    messages: [
      { id: "msg_tk5_1", author: "Ben Tan", direction: "inbound", channel: "X (Twitter)", body: "Loved the track played right after the traffic update this morning, can you help identify it?", createdAt: day(0) },
      { id: "msg_tk5_2", author: "Class 95FM Socials", direction: "outbound", channel: "X (Twitter)", body: "Hi Ben - that was 'Sunset Drive' off Class 95's new local playlist! Full tracklist is up on our site.", createdAt: day(0) },
    ],
  },
  {
    id: "tk_6", channel: "Broadcast", contactChannel: "Phone", category: "Subtitle/caption error", subject: "Chinese subtitles missing for last 10 min of Ch8 drama", body: "The 9pm drama last night lost its Chinese subtitles for roughly the last 10 minutes of the episode.", requesterName: "Michelle Ang", requesterContact: "+65 9123 8890", status: "Open", priority: "Medium", assignee: "Support Team B", createdAt: day(-2), updatedAt: day(-1),
    messages: [
      { id: "msg_tk6_1", author: "Michelle Ang", direction: "inbound", channel: "Phone", body: "Call logged: viewer reports the 9pm drama last night lost its Chinese subtitles for roughly the last 10 minutes of the episode.", createdAt: day(-2) },
      { id: "msg_tk6_2", author: "Support Team B", direction: "outbound", channel: "Phone", body: "Callback made - confirmed a caption-encoder glitch on last night's broadcast and passed it to master control to prevent a repeat.", createdAt: day(-1) },
    ],
  },
  {
    id: "tk_7", channel: "Broadcast", contactChannel: "Email", category: "Content complaint (IMDA)", subject: "Complaint re: content shown before watershed hour", body: "Viewer flagged a scene on Channel 5 at 8:40pm as inappropriate for the pre-watershed slot; may need IMDA escalation.", requesterName: "Anonymous Viewer", requesterContact: "feedback@mediacorp.com.sg", status: "Pending", priority: "Urgent", assignee: "Support Team B", createdAt: day(-5), updatedAt: day(-1),
    messages: [
      { id: "msg_tk7_1", author: "Anonymous Viewer", direction: "inbound", channel: "Email", body: "Viewer flagged a scene on Channel 5 at 8:40pm as inappropriate for the pre-watershed slot; may need IMDA escalation.", createdAt: day(-5) },
      { id: "msg_tk7_2", author: "Support Team B", direction: "outbound", channel: "Email", body: "Thank you for the feedback - this has been logged and escalated to our Standards & Practices team for review in line with IMDA content guidelines.", createdAt: day(-1) },
    ],
  },
  {
    id: "tk_8", channel: "Broadcast", contactChannel: "WhatsApp Business", category: "Contest entry", subject: "Gold 905 'Golden Getaway' contest - entry not counted", body: "Submitted my entry via SMS twice but the website says I'm not on the entrants list.", requesterName: "Nurul Huda", requesterContact: "+65 9765 4321", status: "Resolved", priority: "Low", assignee: "Support Team A", createdAt: day(-9), updatedAt: day(-6), resolvedAt: day(-6),
    messages: [
      { id: "msg_tk8_1", author: "Nurul Huda", direction: "inbound", channel: "WhatsApp Business", body: "Submitted my entry via SMS twice but the website says I'm not on the entrants list.", createdAt: day(-9) },
      { id: "msg_tk8_2", author: "Support Team A", direction: "outbound", channel: "WhatsApp Business", body: "Hi Nurul, good news - we found your double SMS entry and confirmed you're on the entrants list for the Golden Getaway draw.", createdAt: day(-6) },
    ],
  },

  // Advertiser & agency
  {
    id: "tk_9", channel: "Advertiser", contactChannel: "Email", category: "Make-good request", subject: "Missed 7pm spot on Ch5 - requesting make-good", orgId: "co_singtel", body: "Our 7pm Ch5 spot on Tuesday didn't air due to programming change - requesting a make-good slot this week.", requesterName: "Jonathan Ng", requesterContact: "jonathan.ng@singtel.com", status: "Open", priority: "High", assignee: "Ad Ops Team", createdAt: day(-3), updatedAt: day(-1),
    messages: [
      { id: "msg_tk9_1", author: "Jonathan Ng", direction: "inbound", channel: "Email", body: "Our 7pm Ch5 spot on Tuesday didn't air due to programming change - requesting a make-good slot this week.", createdAt: day(-3) },
      { id: "msg_tk9_2", author: "Ad Ops Team", direction: "outbound", channel: "Email", body: "Hi Jonathan, confirmed - the programming change was on our end. We've secured a make-good slot this Thursday 7pm on Channel 5 at no cost to Singtel.", createdAt: day(-1) },
    ],
  },
  {
    id: "tk_10", channel: "Advertiser", contactChannel: "Email", category: "Invoice dispute", subject: "Invoice INV-88213 amount doesn't match booked rate card", orgId: "co_pg", body: "The invoiced amount for the Q4 TV bundle is about 8% higher than the rate card we agreed with Wavemaker.", requesterName: "Marcus Lim", requesterContact: "marcus.lim@pg.com", status: "Pending", priority: "High", assignee: "Ad Ops Team", createdAt: day(-6), updatedAt: day(-2),
    messages: [
      { id: "msg_tk10_1", author: "Marcus Lim", direction: "inbound", channel: "Email", body: "The invoiced amount for the Q4 TV bundle is about 8% higher than the rate card we agreed with Wavemaker.", createdAt: day(-6) },
      { id: "msg_tk10_2", author: "Ad Ops Team", direction: "outbound", channel: "Email", body: "Hi Marcus, we're reconciling INV-88213 against the Wavemaker rate card now and will confirm the correct figure by Friday.", createdAt: day(-2) },
    ],
  },
  {
    id: "tk_11", channel: "Advertiser", contactChannel: "Phone", category: "Creative rejection", subject: "Creative asset rejected - exceeds content guidelines", orgId: "co_shopee", body: "Submitted 11.11 creative was flagged for exceeding on-screen price-claim guidelines; need revised specs.", requesterName: "Wei Ling Koh", requesterContact: "+65 9456 2201", status: "New", priority: "Medium", assignee: "Unassigned", createdAt: day(-1), updatedAt: day(-1),
    messages: [
      { id: "msg_tk11_1", author: "Wei Ling Koh", direction: "inbound", channel: "Phone", body: "Call logged: submitted 11.11 creative was flagged for exceeding on-screen price-claim guidelines; requesting revised specs.", createdAt: day(-1) },
      { id: "msg_tk11_2", author: "Ad Ops Team", direction: "outbound", channel: "Phone", body: "Callback made - confirmed we'll send over the revised on-screen price-claim specs by end of day so the 11.11 creative can be re-submitted.", createdAt: day(-1) },
    ],
  },

  // Corporate & press
  {
    id: "tk_12", channel: "Corporate", contactChannel: "Email", category: "Media inquiry", subject: "Press inquiry: Star Awards 2026 nominee list", body: "Journalist requesting early access/comment on Star Awards nominee announcement for an embargoed feature.", requesterName: "Reuben Fernandez", requesterContact: "reuben.f@straitstimes.example.com", status: "Open", priority: "Medium", assignee: "Corp Comms", createdAt: day(-2), updatedAt: day(-1),
    messages: [
      { id: "msg_tk12_1", author: "Reuben Fernandez", direction: "inbound", channel: "Email", body: "Journalist requesting early access/comment on Star Awards nominee announcement for an embargoed feature.", createdAt: day(-2) },
      { id: "msg_tk12_2", author: "Corp Comms", direction: "outbound", channel: "Email", body: "Hi Reuben, thanks for reaching out - we can share the nominee list under embargo ahead of the official announcement. Sending the media kit shortly.", createdAt: day(-1) },
    ],
  },
  {
    id: "tk_13", channel: "Corporate", contactChannel: "Web Help Centre", category: "Content licensing request", subject: "Request to license Mediacorp archival news footage", body: "Documentary producer requesting a quote to license 1990s CNA archival footage for a historical documentary.", requesterName: "Wong Kah Meng", requesterContact: "kahmeng.wong@indiedocs.example.com", status: "New", priority: "Low", assignee: "Unassigned", createdAt: day(-4), updatedAt: day(-4),
    messages: [
      { id: "msg_tk13_1", author: "Wong Kah Meng", direction: "inbound", channel: "Web Help Centre", body: "Documentary producer requesting a quote to license 1990s CNA archival footage for a historical documentary.", createdAt: day(-4) },
      { id: "msg_tk13_2", author: "Corp Comms", direction: "outbound", channel: "Web Help Centre", body: "Thanks for your enquiry - we've routed this to our archive licensing team, who will follow up with a quote within 5 business days.", createdAt: day(-4) },
    ],
  },
  {
    id: "tk_14", channel: "Corporate", contactChannel: "Email", category: "Copyright / DMCA takedown", subject: "Unauthorized re-upload of meWATCH original on YouTube", body: "Full episodes of a meWATCH original series found re-uploaded without authorization; requesting takedown.", requesterName: "Legal Monitoring (Automated)", requesterContact: "tellmediacorpdigital@mediacorp.com.sg", status: "Open", priority: "High", assignee: "Corp Comms", createdAt: day(-1), updatedAt: day(0),
    messages: [
      { id: "msg_tk14_1", author: "Legal Monitoring (Automated)", direction: "inbound", channel: "Email", body: "Full episodes of a meWATCH original series found re-uploaded without authorization; requesting takedown.", createdAt: day(-1) },
      { id: "msg_tk14_2", author: "Corp Comms", direction: "outbound", channel: "Email", body: "Takedown notice has been filed with the platform citing unauthorized redistribution; monitoring for compliance.", createdAt: day(0) },
    ],
  },
];

export const seedTasks: Task[] = [
  { id: "tsk_1", engagementId: "eg_1", title: "Send revised rate card reflecting bundled discount", dueDate: day(1), done: false, owner: "Astha Mundhra", createdAt: day(-2) },
  { id: "tsk_2", engagementId: "eg_2", title: "Follow up with Wavemaker on avails feedback", dueDate: day(2), done: false, owner: "Astha Mundhra", createdAt: day(-5) },
  { id: "tsk_3", engagementId: "eg_4", title: "Prepare MeID audience analytics deck for Singtel pitch", dueDate: day(3), done: false, owner: "Astha Mundhra", createdAt: day(-4) },
  { id: "tsk_4", engagementId: "eg_10", title: "Confirm exclusivity window with CJ ENM legal", dueDate: day(2), done: false, owner: "Astha Mundhra", createdAt: day(-3) },
  { id: "tsk_5", engagementId: "eg_18", title: "Get contract counter-signed by Ryan Lim's agency", dueDate: day(4), done: false, owner: "Astha Mundhra", createdAt: day(-2) },
  { id: "tsk_6", engagementId: "eg_26", title: "Schedule renewal call with SMRT Media before contract lapses", dueDate: day(2), done: false, owner: "Astha Mundhra", createdAt: day(-3) },
  { id: "tsk_7", ticketId: "tk_9", title: "Confirm available make-good slot with traffic team", dueDate: day(1), done: false, owner: "Astha Mundhra", createdAt: day(-2) },
  { id: "tsk_8", ticketId: "tk_2", title: "Verify duplicate charge with payments processor", dueDate: day(0), done: false, owner: "Astha Mundhra", createdAt: day(-1) },
  { id: "tsk_9", engagementId: "eg_3", title: "Send post-campaign performance report", dueDate: day(-3), done: true, owner: "Astha Mundhra", createdAt: day(-10) },
  { id: "tsk_10", engagementId: "eg_22", title: "Confirm Toyota branding placements for Star Awards red carpet", dueDate: day(2), done: false, owner: "Astha Mundhra", createdAt: day(-4) },
];

export const seedNotes: Note[] = [
  { id: "nt_1", engagementId: "eg_1", orgId: "co_unilever", contactId: "ct_1", body: "Rachel is keen on a National Day tie-in across TV + digital. Wants MeID data on 25-34 female segment reach before finalizing budget.", author: "Astha Mundhra", createdAt: day(-2) },
  { id: "nt_2", engagementId: "eg_4", orgId: "co_singtel", contactId: "ct_4", body: "Jonathan flagged that Dentsu is also in talks with a competing broadcaster. Need to move fast on the DOOH + CNA bundle pricing.", author: "Astha Mundhra", createdAt: day(-1) },
  { id: "nt_3", engagementId: "eg_3", orgId: "co_dbs", contactId: "ct_3", body: "Campaign wrapped strong - 4.2M meWATCH impressions, above forecast. Priya open to renewing for Q1 next year.", author: "Astha Mundhra", createdAt: day(-10) },
  { id: "nt_4", engagementId: "eg_10", orgId: "co_cjenm", contactId: "ct_d1", body: "CJ ENM wants a minimum 12-month exclusivity window in SG before they'll finalize the license fee.", author: "Astha Mundhra", createdAt: day(-2) },
  { id: "nt_5", engagementId: "eg_26", orgId: "co_smrtmedia", contactId: "ct_l3", body: "SMRT open to renewing but want a 5% higher revenue share given ridership recovery post-pandemic.", author: "Astha Mundhra", createdAt: day(-5) },
  { id: "nt_6", ticketId: "tk_9", orgId: "co_singtel", body: "Confirmed programming change was on our end (breaking news override). Make-good approved for Thursday 7pm slot.", author: "Astha Mundhra", createdAt: day(-1) },
];
