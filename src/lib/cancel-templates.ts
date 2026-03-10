import { CancellationPeriod } from "./services";

export interface CancelTemplate {
  cancelUrl?: string;
  cancelEmail?: string;
  emailSubject: string;
  emailBody: (userName: string, serviceName: string) => string;
}

/** Cancel URLs and email templates for known services */
export const cancelTemplates: Record<string, CancelTemplate> = {
  // STREAMING & TV
  netflix: {
    cancelUrl: "https://www.netflix.com/cancelplan",
    cancelEmail: "info@account.netflix.com",
    emailSubject: "Opsigelse af Netflix-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Netflix,\n\nJeg ønsker hermed at opsige mit Netflix-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  viaplay: {
    cancelUrl: "https://account.viaplay.dk/subscription",
    cancelEmail: "kundeservice@viaplay.dk",
    emailSubject: "Opsigelse af Viaplay-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Viaplay,\n\nJeg ønsker hermed at opsige mit Viaplay-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  disney: {
    cancelUrl: "https://www.disneyplus.com/account",
    cancelEmail: "help@disneyplus.com",
    emailSubject: "Opsigelse af Disney+-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Disney+,\n\nJeg ønsker hermed at opsige mit Disney+-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  "max-hbo": {
    cancelUrl: "https://play.max.com/settings/subscription",
    cancelEmail: "help@max.com",
    emailSubject: "Opsigelse af Max/HBO-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Max/HBO,\n\nJeg ønsker hermed at opsige mit Max/HBO-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  "tv2-play": {
    cancelUrl: "https://play.tv2.dk/profil/abonnement",
    cancelEmail: "play@444444.tv2.dk",
    emailSubject: "Opsigelse af TV2 Play-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære TV2 Play,\n\nJeg ønsker hermed at opsige mit TV2 Play-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },

  // MUSIK & LYDBØGER
  spotify: {
    cancelUrl: "https://www.spotify.com/account/subscription/",
    cancelEmail: "support@spotify.com",
    emailSubject: "Opsigelse af Spotify-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Spotify,\n\nJeg ønsker hermed at opsige mit Spotify Premium-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  "apple-music": {
    cancelUrl: "https://support.apple.com/da-dk/HT202039",
    emailSubject: "Opsigelse af Apple Music-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Apple,\n\nJeg ønsker hermed at opsige mit Apple Music-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  "youtube-premium": {
    cancelUrl: "https://www.youtube.com/paid_memberships",
    emailSubject: "Opsigelse af YouTube Premium-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære YouTube,\n\nJeg ønsker hermed at opsige mit YouTube Premium-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  mofibo: {
    cancelEmail: "support@mofibo.com",
    emailSubject: "Opsigelse af Mofibo-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Mofibo,\n\nJeg ønsker hermed at opsige mit Mofibo-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  audible: {
    cancelUrl: "https://www.audible.com/account",
    emailSubject: "Opsigelse af Audible-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Audible,\n\nJeg ønsker hermed at opsige mit Audible-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },

  // FITNESS
  "fitness-world": {
    cancelEmail: "kundeservice@fitnessworld.dk",
    emailSubject: "Opsigelse af Fitness World-medlemskab",
    emailBody: (userName, _serviceName) =>
      `Kære Fitness World,\n\nJeg ønsker hermed at opsige mit medlemskab hos Fitness World.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  sats: {
    cancelEmail: "kundeservice@sats.dk",
    emailSubject: "Opsigelse af SATS-medlemskab",
    emailBody: (userName, _serviceName) =>
      `Kære SATS,\n\nJeg ønsker hermed at opsige mit medlemskab hos SATS.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  "fresh-fitness": {
    cancelEmail: "info@freshfitness.dk",
    emailSubject: "Opsigelse af Fresh Fitness-medlemskab",
    emailBody: (userName, _serviceName) =>
      `Kære Fresh Fitness,\n\nJeg ønsker hermed at opsige mit medlemskab hos Fresh Fitness.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  "loop-fitness": {
    cancelEmail: "info@loopfitness.dk",
    emailSubject: "Opsigelse af Loop Fitness-medlemskab",
    emailBody: (userName, _serviceName) =>
      `Kære Loop Fitness,\n\nJeg ønsker hermed at opsige mit medlemskab hos Loop Fitness.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  fitnessdk: {
    cancelEmail: "kontakt@fitnessdk.dk",
    emailSubject: "Opsigelse af Fitnessdk-medlemskab",
    emailBody: (userName, _serviceName) =>
      `Kære Fitnessdk,\n\nJeg ønsker hermed at opsige mit medlemskab hos Fitnessdk.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },

  // SOFTWARE & CLOUD
  adobe: {
    cancelUrl: "https://account.adobe.com/plans",
    cancelEmail: "support@adobe.com",
    emailSubject: "Opsigelse af Adobe Creative Cloud-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Adobe,\n\nJeg ønsker hermed at opsige mit Adobe Creative Cloud-abonnement.\n\nNavn: ${userName}\n\nJeg er opmærksom på den 12 måneders binding.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  "chatgpt-plus": {
    cancelUrl: "https://chat.openai.com/#settings/subscription",
    emailSubject: "Opsigelse af ChatGPT Plus-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære OpenAI,\n\nJeg ønsker hermed at opsige mit ChatGPT Plus-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },

  // AVISER & MAGASINER
  politiken: {
    cancelEmail: "abonnement@444444.politiken.dk",
    emailSubject: "Opsigelse af Politiken-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Politiken,\n\nJeg ønsker hermed at opsige mit Politiken-abonnement.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  berlingske: {
    cancelEmail: "abonnement@444444.berlingske.dk",
    emailSubject: "Opsigelse af Berlingske-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Berlingske,\n\nJeg ønsker hermed at opsige mit Berlingske-abonnement.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  "jyllands-posten": {
    cancelEmail: "abonnement@444444.jyllands-posten.dk",
    emailSubject: "Opsigelse af Jyllands-Posten-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Jyllands-Posten,\n\nJeg ønsker hermed at opsige mit Jyllands-Posten-abonnement.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  zetland: {
    cancelEmail: "hej@zetland.dk",
    emailSubject: "Opsigelse af Zetland-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Zetland,\n\nJeg ønsker hermed at opsige mit Zetland-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },

  // MADLEVERING & BOKSE
  hellofresh: {
    cancelUrl: "https://www.hellofresh.dk/my-account/deliveries",
    cancelEmail: "hej@hellofresh.dk",
    emailSubject: "Opsigelse af HelloFresh-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære HelloFresh,\n\nJeg ønsker hermed at opsige mit HelloFresh-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  goodiebox: {
    cancelEmail: "hello@goodiebox.dk",
    emailSubject: "Opsigelse af Goodiebox-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Goodiebox,\n\nJeg ønsker hermed at opsige mit Goodiebox-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },

  // MOBIL & INTERNET
  telmore: {
    cancelEmail: "kundeservice@telmore.dk",
    emailSubject: "Opsigelse af Telmore-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Telmore,\n\nJeg ønsker hermed at opsige mit mobilabonnement hos Telmore.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  yousee: {
    cancelEmail: "kundeservice@yousee.dk",
    emailSubject: "Opsigelse af YouSee-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære YouSee,\n\nJeg ønsker hermed at opsige mit abonnement hos YouSee.\n\nNavn: ${userName}\n\nJeg er opmærksom på opsigelsesperioden på 1 måned.\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },

  // DATING
  tinder: {
    cancelUrl: "https://tinder.com/settings",
    emailSubject: "Opsigelse af Tinder-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Tinder,\n\nJeg ønsker hermed at opsige mit Tinder-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  bumble: {
    cancelUrl: "https://bumble.com/settings",
    emailSubject: "Opsigelse af Bumble-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Bumble,\n\nJeg ønsker hermed at opsige mit Bumble-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },

  // DIVERSE
  headspace: {
    cancelUrl: "https://www.headspace.com/account",
    emailSubject: "Opsigelse af Headspace-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Headspace,\n\nJeg ønsker hermed at opsige mit Headspace-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
  strava: {
    cancelUrl: "https://www.strava.com/account",
    emailSubject: "Opsigelse af Strava-abonnement",
    emailBody: (userName, _serviceName) =>
      `Kære Strava,\n\nJeg ønsker hermed at opsige mit Strava-abonnement.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  },
};

/** Generate cancel email for a service */
export function generateCancelEmail(
  serviceId: string,
  serviceName: string,
  userName: string
): { subject: string; body: string; toEmail?: string; cancelUrl?: string } {
  const template = cancelTemplates[serviceId];

  if (template) {
    return {
      subject: template.emailSubject,
      body: template.emailBody(userName, serviceName),
      toEmail: template.cancelEmail,
      cancelUrl: template.cancelUrl,
    };
  }

  // Generic fallback
  return {
    subject: `Opsigelse af ${serviceName}-abonnement`,
    body: `Kære ${serviceName},\n\nJeg ønsker hermed at opsige mit abonnement hos ${serviceName}.\n\nNavn: ${userName}\n\nVenligst bekræft opsigelsen.\n\nMed venlig hilsen\n${userName}`,
  };
}

/** Generate downgrade email for a service */
export function generateDowngradeEmail(
  serviceId: string,
  serviceName: string,
  userName: string,
  currentPlan: string,
  newPlan: string,
  newPrice: number
): { subject: string; body: string; toEmail?: string; cancelUrl?: string } {
  const template = cancelTemplates[serviceId];

  return {
    subject: `Nedgradering af ${serviceName}-abonnement`,
    body: `Kære ${serviceName},\n\nJeg ønsker hermed at nedgradere mit ${serviceName}-abonnement.\n\nNuværende plan: ${currentPlan}\nØnsket plan: ${newPlan} (${newPrice} kr/md)\n\nNavn: ${userName}\n\nVenligst bekræft ændringen.\n\nMed venlig hilsen\n${userName}`,
    toEmail: template?.cancelEmail,
    cancelUrl: template?.cancelUrl,
  };
}

/** Calculate savings_from_date based on cancellation period */
export function calculateSavingsFromDate(cancellation: CancellationPeriod): string {
  const now = new Date();
  if (cancellation === "løbende") {
    // Savings start next month
    const date = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return date.toISOString().split("T")[0];
  }
  if (cancellation === "1 md opsigelse") {
    // 1 month notice — savings start in 2 months
    const date = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    return date.toISOString().split("T")[0];
  }
  // 12 md binding — worst case, 12 months from now
  const date = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  return date.toISOString().split("T")[0];
}
