"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Inspektoeren from "@/components/Inspektoeren";
import SupportedBanks from "@/components/SupportedBanks";
import { services, Service, ServiceTier, getCancellationDate, CancellationPeriod } from "@/lib/services";
import { generateCancelEmail, generateDowngradeEmail, calculateSavingsFromDate } from "@/lib/cancel-templates";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface Subscription {
  serviceName: string;
  knownServiceId?: string;
  monthlyAmount: number;
  transactionCount: number;
  lastSeen: string;
  matchedBy: "known_service" | "recurring_pattern";
  icon?: string;
  subscriptionId?: string;
}

type ActionType = "keep" | "downgrade" | "cancel";

interface DashboardItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  transactionCount: number;
  lastSeen: string;
  isKnown: boolean;
  service?: Service;
  matchedTier?: ServiceTier;
  lowerTiers: { tierId: string; label: string; price: number; savingsPerMonth: number }[];
  legacyDowngrade?: { fromLabel: string; toLabel: string; savingsPerMonth: number };
  cancellation?: string;
  subscriptionId?: string;
}

interface ModalState {
  isOpen: boolean;
  type: "cancel" | "downgrade";
  item: DashboardItem | null;
  emailSubject: string;
  emailBody: string;
  toEmail?: string;
  cancelUrl?: string;
  savingsFromDate: string;
  selectedTier?: { label: string; price: number; tierId: string };
}

interface SentEmail {
  serviceName: string;
  type: "cancel" | "downgrade";
  savings: number;
}

/** Derive a display name from an email address */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "";
  return local
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Find the tier closest to a detected price */
function matchTierByPrice(service: Service, detectedPrice: number): ServiceTier | undefined {
  if (!service.tiers) return undefined;
  let best: ServiceTier | undefined;
  let bestDiff = Infinity;
  for (const tier of service.tiers) {
    const diff = Math.abs(tier.price - detectedPrice);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = tier;
    }
  }
  if (best && bestDiff / best.price > 0.3) return undefined;
  return best;
}

/** Get all tiers cheaper than the matched tier */
function getLowerTiersFromTier(
  service: Service,
  matchedTier: ServiceTier
): DashboardItem["lowerTiers"] {
  if (!service.tiers) return [];
  const currentIndex = service.tiers.findIndex((t) => t.id === matchedTier.id);
  if (currentIndex <= 0) return [];
  return service.tiers
    .slice(0, currentIndex)
    .map((t) => ({
      tierId: t.id,
      label: t.label,
      price: t.price,
      savingsPerMonth: matchedTier.price - t.price,
    }))
    .reverse();
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Indlæser...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

// New flow steps: card → connect → scanning → results → confirm → emails
type Step = "card" | "connect" | "scanning" | "results" | "confirm" | "emails";

function DashboardContent() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected") === "true";
  const credentialsId = searchParams.get("credentialsId");
  const tinkCode = searchParams.get("code");
  const error = searchParams.get("error");

  const [step, setStep] = useState<Step>(connected ? "scanning" : "card");
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [unknowns, setUnknowns] = useState<Subscription[]>([]);
  const [scanError, setScanError] = useState<string | null>(error || null);
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const [downgradeTargets, setDowngradeTargets] = useState<Record<string, string>>({});

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // Modal state (used in emails step)
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "cancel",
    item: null,
    emailSubject: "",
    emailBody: "",
    savingsFromDate: "",
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Track which emails have been sent
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);

  // Stripe payment state — card reservation
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardReserved, setCardReserved] = useState(false);
  const [consentGivenAt, setConsentGivenAt] = useState<string | null>(null);

  // Confirm step state
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Paywall state
  const [hasPaid, setHasPaid] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("abovagt_user_id");
    const storedEmail = localStorage.getItem("abovagt_user_email");
    const storedName = localStorage.getItem("abovagt_user_name");
    if (stored) {
      setUserId(stored);
      if (!storedEmail) {
        fetchUserEmail(stored);
      } else {
        setUserEmail(storedEmail);
        if (!storedName) {
          const derived = nameFromEmail(storedEmail);
          setUserName(derived);
          localStorage.setItem("abovagt_user_name", derived);
        }
      }
    }
    if (storedName) setUserName(storedName);

    // Restore paymentIntentId and consent if returning from Tink redirect
    const storedPiId = localStorage.getItem("abovagt_payment_intent_id");
    if (storedPiId) {
      setPaymentIntentId(storedPiId);
      setCardReserved(true);
    }
    const storedConsent = localStorage.getItem("abovagt_consent_given_at");
    if (storedConsent) {
      setConsentGivenAt(storedConsent);
    }
  }, []);

  const fetchUserEmail = async (uid: string) => {
    try {
      const res = await fetch(`/api/actions?userId=${uid}`);
      if (!res.ok) return;
    } catch {
      // silently fail
    }
  };

  // Check if user already has a captured payment (page reload after full flow)
  useEffect(() => {
    if (userId) {
      fetch(`/api/stripe/check-payment?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.hasPaid) setHasPaid(true);
        })
        .catch(() => {});
    }
  }, [userId]);

  // If returning from Tink with card already reserved, go straight to scanning
  useEffect(() => {
    if (connected && userId && cardReserved && step === "card") {
      if (typeof umami !== 'undefined') umami.track('tink_connected');
      setStep("scanning");
    }
  }, [connected, userId, cardReserved, step]);

  useEffect(() => {
    if (connected && userId && step === "scanning") {
      runScan();
    }
  }, [connected, userId, step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-derive userName from email when email changes
  useEffect(() => {
    if (userEmail && !userName) {
      const derived = nameFromEmail(userEmail);
      setUserName(derived);
      localStorage.setItem("abovagt_user_name", derived);
    }
  }, [userEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Card step: create PaymentIntent for 149 kr reservation ----
  const createReservation = async () => {
    if (!userId) return;
    setPaymentLoading(true);
    setPaymentError(null);
    if (typeof umami !== 'undefined') umami.track('payment_start');

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.detail ? `${data.error}: ${data.detail}` : data.error || "Kunne ikke oprette betaling");
        setPaymentLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch {
      setPaymentError("Kunne ikke oprette betaling — prøv igen");
    }
    setPaymentLoading(false);
  };

  // Called when Stripe card is confirmed (status=requires_capture)
  const onCardReserved = (consentTimestamp: string) => {
    setCardReserved(true);
    setConsentGivenAt(consentTimestamp);
    // Store PI ID and consent so it survives the Tink redirect
    if (paymentIntentId) {
      localStorage.setItem("abovagt_payment_intent_id", paymentIntentId);
    }
    localStorage.setItem("abovagt_consent_given_at", consentTimestamp);
    // Move to bank connection step
    setStep("connect");
  };

  // ---- Connect step: Tink bank ----
  const handleConnect = async () => {
    if (!userId) {
      window.location.href = "/connect";
      return;
    }
    if (typeof umami !== 'undefined') umami.track('tink_start');
    try {
      const res = await fetch("/api/tink/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScanError(
          res.status === 503
            ? "Tink bankforbindelse er ikke aktiveret endnu. Vi arbejder på det!"
            : data.error || "Kunne ikke oprette bankforbindelse"
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setScanError("Kunne ikke oprette bankforbindelse");
    }
  };

  const runScan = async () => {
    setStep("scanning");
    setScanError(null);
    try {
      const res = await fetch("/api/tink/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credentialsId, code: tinkCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScanError(data.error || "Scanning fejlede");
        setStep("connect");
        return;
      }
      setSubs(data.subscriptions || []);
      setUnknowns(data.unknownRecurring || []);
      if (typeof umami !== 'undefined') umami.track('scan_complete', { found: (data.subscriptions || []).length + (data.unknownRecurring || []).length });
      setStep("results");
    } catch {
      setScanError("Scanning fejlede — prøv igen");
      setStep("connect");
    }
  };

  // Build unified list of all items with tier info
  const allItems: DashboardItem[] = useMemo(() => {
    const knownItems: DashboardItem[] = subs.map((sub) => {
      const service = sub.knownServiceId
        ? services.find((s) => s.id === sub.knownServiceId)
        : undefined;

      let matchedTier: ServiceTier | undefined;
      let lowerTiers: DashboardItem["lowerTiers"] = [];
      let legacyDowngrade: DashboardItem["legacyDowngrade"];

      if (service) {
        matchedTier = matchTierByPrice(service, sub.monthlyAmount);
        if (matchedTier) {
          lowerTiers = getLowerTiersFromTier(service, matchedTier);
        } else if (service.downgrade) {
          legacyDowngrade = service.downgrade;
        }
      }

      const displayName =
        matchedTier && service
          ? `${service.name} (${matchedTier.label})`
          : sub.serviceName;

      return {
        id: sub.serviceName,
        name: displayName,
        icon: sub.icon || "📦",
        price: sub.monthlyAmount,
        transactionCount: sub.transactionCount,
        lastSeen: sub.lastSeen,
        isKnown: true,
        service,
        matchedTier,
        lowerTiers,
        legacyDowngrade,
        cancellation: service?.cancellation,
        subscriptionId: sub.subscriptionId,
      };
    });

    const unknownItems: DashboardItem[] = unknowns.map((sub) => ({
      id: sub.serviceName,
      name: sub.serviceName,
      icon: "📦",
      price: sub.monthlyAmount,
      transactionCount: sub.transactionCount,
      lastSeen: sub.lastSeen,
      isKnown: false,
      lowerTiers: [],
      subscriptionId: sub.subscriptionId,
    }));

    return [...knownItems, ...unknownItems];
  }, [subs, unknowns]);

  // Initialize actions to "keep" for new items
  useEffect(() => {
    const initial: Record<string, ActionType> = {};
    allItems.forEach((item) => {
      if (!actions[item.id]) initial[item.id] = "keep";
    });
    if (Object.keys(initial).length > 0) {
      setActions((prev) => ({ ...initial, ...prev }));
    }
  }, [allItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalMonthly = allItems.reduce((sum, item) => sum + item.price, 0);
  const totalSubs = allItems.length;

  // Items marked for action
  const cancelledItems = allItems.filter((item) => actions[item.id] === "cancel");
  const downgradedItems = allItems.filter((item) => actions[item.id] === "downgrade");
  const actionItems = [...cancelledItems, ...downgradedItems];

  const cancelSavings = cancelledItems.reduce((sum, item) => sum + item.price, 0);

  const getDowngradeSavingsForItem = (item: DashboardItem): number => {
    if (item.lowerTiers.length > 0) {
      const targetTierId = downgradeTargets[item.id];
      const target = item.lowerTiers.find((t) => t.tierId === targetTierId);
      return target?.savingsPerMonth || item.lowerTiers[0].savingsPerMonth;
    }
    return item.legacyDowngrade?.savingsPerMonth || 0;
  };

  const downgradeSavings = downgradedItems.reduce(
    (sum, item) => sum + getDowngradeSavingsForItem(item),
    0
  );

  const totalSavings = cancelSavings + downgradeSavings;
  const fee = totalSavings > 0 ? Math.min(Math.round(totalSavings * 0.25), 149) : 0;

  const hasDowngrade = (item: DashboardItem) =>
    item.lowerTiers.length > 0 || !!item.legacyDowngrade;

  const setAction = (id: string, action: ActionType) => {
    setActions((prev) => ({ ...prev, [id]: action }));
    const item = allItems.find((i) => i.id === id);
    const serviceName = item?.service?.name || item?.name || id;
    if (action === "cancel" && typeof umami !== 'undefined') umami.track('action_cancel', { service: serviceName });
    if (action === "downgrade" && typeof umami !== 'undefined') umami.track('action_downgrade', { service: serviceName });
  };

  const setDowngradeTarget = (id: string, tierId: string) => {
    setDowngradeTargets((prev) => ({ ...prev, [id]: tierId }));
  };

  // ---- Confirm step: capture actual fee ----
  const handleConfirm = async () => {
    if (!paymentIntentId || !userId) return;
    setConfirmLoading(true);
    setConfirmError(null);

    const actionList = actionItems.map((item) => ({
      type: actions[item.id],
      serviceName: item.service?.name || item.name,
      savings: actions[item.id] === "cancel" ? item.price : getDowngradeSavingsForItem(item),
    }));

    try {
      const res = await fetch("/api/stripe/capture-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          userId,
          totalSavings,
          completedActions: actionList,
          consentGivenAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setConfirmError(data.error || "Kunne ikke gennemføre betaling");
        setConfirmLoading(false);
        return;
      }

      // Clean up stored PI ID and consent
      localStorage.removeItem("abovagt_payment_intent_id");
      localStorage.removeItem("abovagt_consent_given_at");
      if (typeof umami !== 'undefined') umami.track('payment_complete', { amount: data.captured || fee });
      setHasPaid(true);
      setStep("emails");
    } catch {
      setConfirmError("Noget gik galt — prøv igen");
    }
    setConfirmLoading(false);
  };

  // ---- Cancel reservation (user doesn't want to proceed) ----
  const handleCancelReservation = async () => {
    if (!paymentIntentId) return;
    try {
      await fetch("/api/stripe/cancel-reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, userId }),
      });
    } catch {
      // best-effort
    }
    localStorage.removeItem("abovagt_payment_intent_id");
    localStorage.removeItem("abovagt_consent_given_at");
    setPaymentIntentId(null);
    setCardReserved(false);
  };

  // Open email modal
  const openEmailModal = (item: DashboardItem) => {
    const serviceId = item.service?.id || "";
    const serviceName = item.service?.name || item.name;
    const cancellation = (item.cancellation || "løbende") as CancellationPeriod;
    const action = actions[item.id];
    const effectiveName = userName || nameFromEmail(userEmail) || "Bruger";

    if (action === "cancel") {
      const email = generateCancelEmail(serviceId, serviceName, effectiveName);
      setModal({
        isOpen: true,
        type: "cancel",
        item,
        emailSubject: email.subject,
        emailBody: email.body,
        toEmail: email.toEmail,
        cancelUrl: email.cancelUrl,
        savingsFromDate: calculateSavingsFromDate(cancellation),
      });
    } else {
      let currentPlan = item.matchedTier?.label || "Nuværende";
      let newPlan = "";
      let newPrice = 0;
      let selectedTier: ModalState["selectedTier"] = undefined;

      if (item.lowerTiers.length > 0) {
        const targetTierId = downgradeTargets[item.id];
        const target = item.lowerTiers.find((t) => t.tierId === targetTierId) || item.lowerTiers[0];
        newPlan = target.label;
        newPrice = target.price;
        selectedTier = { label: target.label, price: target.price, tierId: target.tierId };
      } else if (item.legacyDowngrade) {
        currentPlan = item.legacyDowngrade.fromLabel;
        newPlan = item.legacyDowngrade.toLabel;
        newPrice = item.price - item.legacyDowngrade.savingsPerMonth;
      }

      const email = generateDowngradeEmail(
        serviceId, serviceName, effectiveName, currentPlan, newPlan, newPrice
      );
      setModal({
        isOpen: true,
        type: "downgrade",
        item,
        emailSubject: email.subject,
        emailBody: email.body,
        toEmail: email.toEmail,
        cancelUrl: email.cancelUrl,
        savingsFromDate: calculateSavingsFromDate(cancellation),
        selectedTier,
      });
    }
    setSendError(null);
  };

  // Send email (requires payment — server enforces this too)
  const handleSendEmail = async () => {
    if (!modal.item || !userId) return;

    setSending(true);
    setSendError(null);

    try {
      const res = await fetch("/api/cancel-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userEmail,
          userName: userName || nameFromEmail(userEmail) || "Bruger",
          serviceName: modal.item.service?.name || modal.item.name,
          serviceId: modal.item.service?.id || "",
          subscriptionId: modal.item.subscriptionId,
          type: modal.type,
          emailSubject: modal.emailSubject,
          emailBody: modal.emailBody,
          toEmail: modal.toEmail,
          savingsFromDate: modal.savingsFromDate,
          monthlyAmount: modal.item.price,
          newPlan: modal.selectedTier?.label,
          newPrice: modal.selectedTier?.price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendError(data.error || "Kunne ikke sende email");
        setSending(false);
        return;
      }

      const savings = modal.type === "cancel"
        ? modal.item.price
        : getDowngradeSavingsForItem(modal.item);

      if (typeof umami !== 'undefined') umami.track('email_sent', { service: modal.item!.service?.name || modal.item!.name });
      setSentEmails((prev) => [
        ...prev,
        {
          serviceName: modal.item!.service?.name || modal.item!.name,
          type: modal.type,
          savings,
        },
      ]);

      setModal((prev) => ({ ...prev, isOpen: false }));
    } catch {
      setSendError("Kunne ikke sende email — prøv igen");
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-black">Abo</span>
              <span className="text-[#1B7A6E]">Vagt</span>
            </a>
            <span className="text-sm text-gray-500">Mit dashboard</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ============ STEP 1: Card reservation ============ */}
        {step === "card" && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Inspektoeren
                pose="pointing"
                size={120}
                speechBubble="Vi reserverer op til 149 kr — du betaler kun for det du sparer!"
                className="mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                Registrer dit kort
              </h1>
              <p className="mt-2 text-gray-600 text-sm">
                Vi reserverer op til 149 kr. Du betaler kun 25% af din faktiske besparelse.
              </p>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
              <h3 className="text-sm font-bold text-[#1C2B2A] mb-3">S&aring;dan virker det</h3>
              <div className="space-y-3">
                {[
                  { num: "1", text: "Vi reserverer op til 149 kr p\u00e5 dit kort (ingen penge tr\u00e6kkes endnu)" },
                  { num: "2", text: "Du forbinder din bank s\u00e5 vi kan finde dine abonnementer" },
                  { num: "3", text: "Du v\u00e6lger hvad du vil opsige eller nedgradere" },
                  { num: "4", text: "Vi tr\u00e6kker kun 25% af din besparelse (maks 149 kr)" },
                ].map((s) => (
                  <div key={s.num} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#1B7A6E] text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {s.num}
                    </span>
                    <p className="text-sm text-gray-700">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stripe card form */}
            {!clientSecret && !paymentLoading && (
              <button
                onClick={createReservation}
                className="w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
              >
                Registrer kort og reserver
              </button>
            )}

            {paymentLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#1B7A6E] border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm text-gray-500">Opretter reservation...</span>
              </div>
            )}

            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-sm text-red-700">{paymentError}</p>
              </div>
            )}

            {clientSecret && !paymentLoading && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <h3 className="text-sm font-bold text-[#1C2B2A] mb-4">Kortoplysninger</h3>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: { colorPrimary: "#1B7A6E", borderRadius: "8px" },
                    },
                    locale: "da",
                  }}
                >
                  <ReservationForm onSuccess={onCardReserved} />
                </Elements>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {[
                "Ingen penge tr\u00e6kkes nu \u2014 kun reservation",
                "Du betaler kun hvis du f\u00e5r en besparelse",
                "Reservationen annulleres automatisk efter 7 dage hvis du ikke handler",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-left">
                  <svg className="w-5 h-5 text-[#1B7A6E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <a href="/" className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors">&larr; Tilbage til forsiden</a>
            </div>
          </div>
        )}

        {/* ============ STEP 2: Connect bank ============ */}
        {step === "connect" && (
          <div className="max-w-md mx-auto text-center">
            <Inspektoeren
              pose="searching"
              size={120}
              speechBubble="Kort registreret! Nu forbinder vi din bank."
              className="mb-6"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A] mb-3">
              Forbind din bank
            </h1>
            <p className="text-gray-600 mb-8">
              Vi forbinder sikkert via Tink. Vi kan kun l&aelig;se dine transaktioner
              &mdash; aldrig flytte penge.
            </p>
            {scanError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-red-700">{scanError}</p>
              </div>
            )}
            <SupportedBanks compact />

            <button
              onClick={handleConnect}
              className="w-full mt-6 px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
            >
              Forbind min bank
            </button>
            <div className="mt-8 space-y-3">
              {[
                "Sikker forbindelse via Tink (reguleret af Finanstilsynet)",
                "Kun l\u00e6seadgang \u2014 vi kan aldrig flytte penge",
                "Dine data slettes n\u00e5r du vil",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-left">
                  <svg className="w-5 h-5 text-[#1B7A6E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ STEP 3: Scanning ============ */}
        {step === "scanning" && (
          <div className="max-w-md mx-auto text-center py-12">
            <Inspektoeren pose="searching" size={120} className="mb-6" />
            <h2 className="text-2xl font-bold text-[#1C2B2A] mb-3">
              Scanner dine transaktioner...
            </h2>
            <p className="text-gray-600 mb-8">
              Inspekt&oslash;ren leder efter abonnementer i dine banktransaktioner
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-3 border-[#1B7A6E] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* ============ STEP 4: Results (select actions) ============ */}
        {step === "results" && (
          <div>
            <div className="text-center mb-8">
              <Inspektoeren
                pose="pointing"
                size={120}
                speechBubble={
                  totalSavings > 0
                    ? `Du kan spare ${totalSavings.toLocaleString("da-DK")} kr/md!`
                    : `Jeg fandt ${totalSubs} abonnementer for ${totalMonthly.toLocaleString("da-DK")} kr/md!`
                }
                className="mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                Dine abonnementer
              </h1>
              <p className="mt-2 text-gray-600 text-sm">
                V&aelig;lg hvad du vil g&oslash;re med hvert abonnement
              </p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">M&aring;nedligt forbrug</p>
                <p className="text-3xl font-bold text-[#1C2B2A]">{totalMonthly.toLocaleString("da-DK")} kr/md</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">&Aring;rligt forbrug</p>
                <p className="text-3xl font-bold text-[#1C2B2A]">{(totalMonthly * 12).toLocaleString("da-DK")} kr/&aring;r</p>
              </div>
              <div className={`rounded-2xl border-2 p-5 text-center transition-all ${totalSavings > 0 ? "bg-teal-50 border-[#1B7A6E]" : "bg-white border-gray-200"}`}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Din besparelse</p>
                <p className={`text-3xl font-bold ${totalSavings > 0 ? "text-[#1B7A6E]" : "text-[#1C2B2A]"}`}>
                  {totalSavings.toLocaleString("da-DK")} kr/md
                </p>
              </div>
            </div>

            {/* Subscription list — select keep/downgrade/cancel */}
            {allItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1C2B2A] mb-4">Dine abonnementer</h2>
                <div className="space-y-3">
                  {allItems.map((item) => {
                    const action = actions[item.id] || "keep";
                    const canDowngrade = hasDowngrade(item);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border overflow-hidden transition-all ${
                          action === "cancel" ? "border-red-300"
                          : action === "downgrade" ? "border-orange-300"
                          : "border-gray-200"
                        }`}
                      >
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <p className={`font-semibold ${action === "cancel" ? "text-gray-400 line-through" : "text-[#1C2B2A]"}`}>
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.transactionCount} transaktioner fundet
                                  {item.cancellation && item.cancellation !== "løbende" && (
                                    <span className="ml-2 text-orange-600">{item.cancellation}</span>
                                  )}
                                  {!item.isKnown && (
                                    <span className="ml-2 text-orange-500">Muligt abonnement</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${action === "cancel" ? "text-gray-400 line-through" : "text-[#1C2B2A]"}`}>
                                {item.price} kr/md
                              </p>
                              {action === "cancel" && (
                                <p className="text-xs text-red-600 font-medium">Spar {item.price} kr/md</p>
                              )}
                              {action === "downgrade" && (
                                <p className="text-xs text-orange-600 font-medium">Spar {getDowngradeSavingsForItem(item)} kr/md</p>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => setAction(item.id, "keep")}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                action === "keep"
                                  ? "bg-gray-700 text-white border-gray-700"
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              Behold
                            </button>
                            {canDowngrade && (
                              <button
                                onClick={() => setAction(item.id, "downgrade")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                  action === "downgrade"
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                                }`}
                              >
                                Nedgrader
                              </button>
                            )}
                            <button
                              onClick={() => setAction(item.id, "cancel")}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                action === "cancel"
                                  ? "bg-red-500 text-white border-red-500"
                                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                              }`}
                            >
                              Opsig
                            </button>
                          </div>

                          {/* Downgrade tier picker */}
                          {action === "downgrade" && item.lowerTiers.length > 0 && (
                            <div className="mt-3 bg-orange-50 rounded-lg px-4 py-3 border border-orange-100">
                              <p className="text-xs text-orange-700 font-semibold mb-2">V&aelig;lg billigere plan:</p>
                              <div className="space-y-1.5">
                                {item.lowerTiers.map((tier) => {
                                  const isSelected = (downgradeTargets[item.id] || item.lowerTiers[0].tierId) === tier.tierId;
                                  return (
                                    <label
                                      key={tier.tierId}
                                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected ? "bg-orange-100 border border-orange-300" : "bg-white border border-gray-200 hover:bg-orange-50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`downgrade-${item.id}`}
                                          checked={isSelected}
                                          onChange={() => setDowngradeTarget(item.id, tier.tierId)}
                                          className="w-3.5 h-3.5 text-orange-500 focus:ring-orange-400"
                                        />
                                        <span className="text-sm text-gray-800">{item.service?.name} {tier.label}</span>
                                        <span className="text-xs text-gray-500">{tier.price} kr/md</span>
                                      </div>
                                      <span className="text-xs font-bold text-orange-600">Spar {tier.savingsPerMonth} kr/md</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Legacy downgrade info */}
                          {action === "downgrade" && item.lowerTiers.length === 0 && item.legacyDowngrade && (
                            <div className="mt-3 bg-orange-50 rounded-lg px-3 py-2.5 flex items-start gap-2">
                              <svg className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <p className="text-sm text-orange-700">
                                <span className="font-medium">{item.legacyDowngrade.fromLabel}</span>
                                {" \u2192 "}
                                <span className="font-medium">{item.legacyDowngrade.toLabel}</span>
                                {" \u2014 spar "}
                                <span className="font-bold">{item.legacyDowngrade.savingsPerMonth} kr/md</span>
                              </p>
                            </div>
                          )}

                          {/* Cancel period notice */}
                          {action === "cancel" && item.cancellation && item.cancellation !== "løbende" && (
                            <div className="mt-3 bg-red-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-xs text-red-700">
                                <span className="font-semibold">OBS:</span>{" "}
                                {item.service?.name || item.name} har {item.cancellation} &mdash; du sparer fra{" "}
                                {getCancellationDate(item.cancellation as CancellationPeriod)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No results */}
            {allItems.length === 0 && (
              <div className="text-center py-12">
                <Inspektoeren pose="thumbsup" size={100} className="mb-4" />
                <p className="text-lg font-semibold text-[#1C2B2A]">Ingen abonnementer fundet</p>
                <p className="text-sm text-gray-500 mt-2">Vi fandt ingen tilbagevendende betalinger i dine transaktioner</p>
              </div>
            )}

            {/* Savings summary */}
            {allItems.length > 0 && (
              <div className="bg-[#1C2B2A] text-white rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold mb-4 text-center">Din samlede besparelse</h3>
                {cancelledItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-white/80">
                      Opsigelser: <span className="font-bold text-white">{cancelSavings.toLocaleString("da-DK")} kr/md</span>
                      <span className="text-white/50 ml-1">({cancelledItems.length} {cancelledItems.length === 1 ? "abonnement" : "abonnementer"})</span>
                    </p>
                    <div className="mt-1.5 space-y-1">
                      {cancelledItems.map((item) => (
                        <p key={item.id} className="text-xs text-white/50 pl-2">{item.icon} {item.name}: {item.price} kr/md</p>
                      ))}
                    </div>
                  </div>
                )}
                {downgradedItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-white/80">
                      Nedgraderinger: <span className="font-bold text-[#4ECDC4]">{downgradeSavings.toLocaleString("da-DK")} kr/md</span>
                      <span className="text-white/50 ml-1">({downgradedItems.length} {downgradedItems.length === 1 ? "abonnement" : "abonnementer"})</span>
                    </p>
                    <div className="mt-1.5 space-y-1">
                      {downgradedItems.map((item) => (
                        <p key={item.id} className="text-xs text-white/50 pl-2">{item.icon} {item.name}: spar {getDowngradeSavingsForItem(item)} kr/md</p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t border-white/20 mt-4 pt-4 text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Samlet besparelse</p>
                  <p className="text-4xl font-bold text-[#4ECDC4]">{totalSavings.toLocaleString("da-DK")} kr/md</p>
                  {totalSavings > 0 && (
                    <p className="text-sm text-white/50 mt-1">= {(totalSavings * 12).toLocaleString("da-DK")} kr/&aring;r</p>
                  )}
                </div>
                {totalSavings === 0 && (
                  <p className="text-center text-sm text-white/60 mt-2">
                    V&aelig;lg &quot;Opsig&quot; eller &quot;Nedgrader&quot; ovenfor for at se din besparelse
                  </p>
                )}
              </div>
            )}

            {/* CTA: Go to confirm step */}
            {totalSavings > 0 && !hasPaid && (
              <div className="relative bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-8 mb-8">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  Din pris
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 mt-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Din besparelse</span>
                      <span className="text-sm font-bold text-[#1C2B2A]">{totalSavings.toLocaleString("da-DK")} kr/md</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vi tr&aelig;kker</span>
                      <span className="text-sm font-bold text-[#1C2B2A]">{fee.toLocaleString("da-DK")} kr (en gang)</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#1B7A6E]">Du beholder</span>
                      <span className="text-lg font-bold text-[#1B7A6E]">{(totalSavings - fee).toLocaleString("da-DK")} kr/md &mdash; hver m&aring;ned fremover</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep("confirm")}
                  className="mt-4 w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
                >
                  Godkend og f&aring; dine opsigelsesmails
                </button>
                <p className="mt-4 text-center text-xs text-gray-500">
                  Vi tr&aelig;kker {fee} kr af de {cardReserved ? "149" : fee} kr der er reserveret. Resten frigives.
                </p>
              </div>
            )}

            {/* Already paid: go to emails */}
            {hasPaid && actionItems.length > 0 && (
              <div className="bg-green-50 rounded-2xl border-2 border-green-400 p-6 mb-8 text-center">
                <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-green-800 mb-1">Betaling gennemf&oslash;rt!</h3>
                <p className="text-sm text-green-700 mb-4">Dine opsigelsesmails er klar til afsendelse.</p>
                <button
                  onClick={() => setStep("emails")}
                  className="px-6 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20"
                >
                  Se og send dine opsigelsesmails
                </button>
              </div>
            )}

            {/* Monitoring upsell */}
            {allItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1C2B2A] mb-1">AboVagt Monitoring</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Vi scanner dine transaktioner kvartalsvis og giver dig besked ved nye abonnementer eller pris&aelig;ndringer.
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-[#1C2B2A]">15 kr/md</span>
                      <span className="text-xs text-gray-500">Kvartalsvis scanning &middot; Opsig n&aring;r som helst</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <a href="/" className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors">&larr; Tilbage til forsiden</a>
            </div>
          </div>
        )}

        {/* ============ STEP 5: Confirm (capture actual fee) ============ */}
        {step === "confirm" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <Inspektoeren
                pose="thumbsup"
                size={120}
                speechBubble={`Vi tr\u00e6kker kun ${fee} kr af de 149 kr!`}
                className="mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                Bekr&aelig;ft betaling
              </h1>
              <p className="mt-2 text-gray-600 text-sm">
                Gennemg&aring; din besparelse og godkend
              </p>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h2 className="text-sm font-bold text-[#1C2B2A] mb-3">Dine handlinger</h2>
              {actionItems.map((item) => {
                const act = actions[item.id];
                const sav = act === "cancel" ? item.price : getDowngradeSavingsForItem(item);
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-gray-700">{item.service?.name || item.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${act === "cancel" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                        {act === "cancel" ? "Opsig" : "Nedgrader"}
                      </span>
                    </div>
                    <span className="font-medium text-[#1B7A6E]">-{sav} kr/md</span>
                  </div>
                );
              })}
            </div>

            {/* Payment breakdown */}
            <div className="bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Din besparelse</span>
                  <span className="text-sm font-bold text-[#1C2B2A]">{totalSavings.toLocaleString("da-DK")} kr/md</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">&Aring;rlig besparelse</span>
                  <span className="text-sm font-bold text-[#1C2B2A]">{(totalSavings * 12).toLocaleString("da-DK")} kr/&aring;r</span>
                </div>
                <div className="border-t border-[#1B7A6E]/20 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reserveret p&aring; dit kort</span>
                    <span className="text-sm text-gray-500">149 kr</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[#1C2B2A]">Vi tr&aelig;kker</span>
                    <span className="text-lg font-bold text-[#1C2B2A]">{fee.toLocaleString("da-DK")} kr</span>
                  </div>
                  {fee < 149 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-500">Frigives til dit kort</span>
                      <span className="text-sm text-gray-500">{149 - fee} kr</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {confirmError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-sm text-red-700">{confirmError}</p>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={confirmLoading}
              className={`w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg mb-4 ${
                confirmLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {confirmLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Behandler...
                </span>
              ) : (
                `Godkend \u2014 tr\u00e6k ${fee.toLocaleString("da-DK")} kr`
              )}
            </button>

            <div className="text-center space-y-2">
              <button onClick={() => setStep("results")} className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors">
                &larr; Tilbage til dine abonnementer
              </button>
              <p className="text-xs text-gray-400">
                Vil du ikke alligevel?{" "}
                <button
                  onClick={async () => {
                    await handleCancelReservation();
                    setStep("card");
                  }}
                  className="text-red-500 hover:text-red-700 underline"
                >
                  Annull&eacute;r reservation
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============ STEP 6: Emails (unlocked after payment) ============ */}
        {step === "emails" && hasPaid && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <Inspektoeren
                pose="thumbsup"
                size={120}
                speechBubble="Tak! Her er dine opsigelsesmails."
                className="mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                Dine opsigelsesmails
              </h1>
              <p className="mt-2 text-gray-600 text-sm">
                Klik p&aring; hver for at se og sende opsigelsesmailen
              </p>
            </div>

            {/* Name input */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
              <label className="block text-sm font-semibold text-[#1C2B2A] mb-2">
                Dit navn (bruges i opsigelsesmails)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  localStorage.setItem("abovagt_user_name", e.target.value);
                }}
                placeholder="F.eks. Jonas Nielsen"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#1B7A6E] focus:ring-1 focus:ring-[#1B7A6E] outline-none text-sm"
              />
            </div>

            {/* Email list */}
            <div className="space-y-3 mb-8">
              {actionItems.map((item) => {
                const act = actions[item.id];
                const sav = act === "cancel" ? item.price : getDowngradeSavingsForItem(item);
                const isSent = sentEmails.some((s) => s.serviceName === (item.service?.name || item.name));

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border overflow-hidden transition-all ${
                      isSent ? "border-green-300 bg-green-50/50" : act === "cancel" ? "border-red-200" : "border-orange-200"
                    }`}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <p className={`font-semibold ${isSent ? "text-green-700" : "text-[#1C2B2A]"}`}>
                              {item.service?.name || item.name}
                              {isSent && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Sendt</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {act === "cancel" ? "Opsigelse" : "Nedgradering"} &mdash; spar {sav} kr/md
                              {item.cancellation && item.cancellation !== "løbende" && (
                                <span className="ml-1 text-orange-600">({item.cancellation})</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {!isSent && (
                          <button
                            onClick={() => openEmailModal(item)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all ${
                              act === "cancel" ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
                            }`}
                          >
                            Se &amp; send
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary after all sent */}
            {sentEmails.length === actionItems.length && actionItems.length > 0 && (
              <div className="bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 mb-6 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Du sparer nu</p>
                <p className="text-4xl font-bold text-[#1B7A6E]">{totalSavings.toLocaleString("da-DK")} kr/md</p>
                <p className="text-sm text-gray-500 mt-1">= {(totalSavings * 12).toLocaleString("da-DK")} kr/&aring;r</p>
                <p className="text-sm text-[#1B7A6E] font-medium mt-3">
                  Alle {actionItems.length} opsigelsesmails er sendt!
                </p>
              </div>
            )}

            <div className="text-center">
              <a href="/" className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors">&larr; Tilbage til forsiden</a>
            </div>
          </div>
        )}
      </div>

      {/* ============ EMAIL MODAL ============ */}
      {modal.isOpen && modal.item && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !sending && setModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`px-6 py-4 border-b ${modal.type === "cancel" ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-bold ${modal.type === "cancel" ? "text-red-800" : "text-orange-800"}`}>
                  {modal.type === "cancel" ? "Opsig" : "Nedgrader"} {modal.item.service?.name || modal.item.name}
                </h2>
                <button
                  onClick={() => !sending && setModal((prev) => ({ ...prev, isOpen: false }))}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  disabled={sending}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Cancellation period warning */}
              {modal.item.cancellation && modal.item.cancellation !== "løbende" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">OBS:</span>{" "}
                    {modal.item.service?.name || modal.item.name} har {modal.item.cancellation} &mdash; du sparer fra{" "}
                    <span className="font-semibold">{getCancellationDate(modal.item.cancellation as CancellationPeriod)}</span>
                  </p>
                </div>
              )}

              {/* Cancel URL */}
              {modal.cancelUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-blue-800 mb-1">Du kan ogs&aring; opsige direkte:</p>
                  <a href={modal.cancelUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline break-all">
                    {modal.cancelUrl}
                  </a>
                </div>
              )}

              {/* Email fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emne</label>
                <input
                  type="text"
                  value={modal.emailSubject}
                  onChange={(e) => setModal((prev) => ({ ...prev, emailSubject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1B7A6E] focus:ring-1 focus:ring-[#1B7A6E] outline-none text-sm"
                  disabled={sending}
                />
              </div>

              {modal.toEmail && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Til</label>
                  <input
                    type="email"
                    value={modal.toEmail}
                    onChange={(e) => setModal((prev) => ({ ...prev, toEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1B7A6E] focus:ring-1 focus:ring-[#1B7A6E] outline-none text-sm"
                    disabled={sending}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email-indhold</label>
                <textarea
                  value={modal.emailBody}
                  onChange={(e) => setModal((prev) => ({ ...prev, emailBody: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1B7A6E] focus:ring-1 focus:ring-[#1B7A6E] outline-none text-sm font-mono resize-y"
                  disabled={sending}
                />
              </div>

              <p className="text-xs text-gray-500">
                Emailen sendes fra AboVagt med din email ({userEmail || "din email"}) som svar-adresse.
              </p>

              {sendError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-700">{sendError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              {!hasPaid && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
                  <p className="text-sm text-amber-800">
                    Du skal gennemf&oslash;re betaling f&oslash;r du kan sende opsigelsesmails.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => !sending && setModal((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all text-sm"
                  disabled={sending}
                >
                  Annuller
                </button>
                {hasPaid ? (
                  <button
                    onClick={handleSendEmail}
                    disabled={sending}
                    className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-lg transition-all text-sm ${
                      modal.type === "cancel" ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
                    } ${sending ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {sending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sender...
                      </span>
                    ) : (
                      `Send ${modal.type === "cancel" ? "opsigelse" : "nedgradering"}`
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setModal((prev) => ({ ...prev, isOpen: false }));
                      setStep("confirm");
                    }}
                    className="flex-1 px-4 py-2.5 bg-[#1B7A6E] text-white font-semibold rounded-lg hover:bg-[#155F56] transition-all text-sm"
                  >
                    Betal og l&aring;s op &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Stripe Reservation Form — confirms the card and reserves 149 kr */
function ReservationForm({ onSuccess }: { onSuccess: (consentGivenAt: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptWaiver, setAcceptWaiver] = useState(false);

  const canSubmit = acceptTerms && acceptWaiver && stripe && !processing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !elements) return;

    setProcessing(true);
    setError(null);

    const consentGivenAt = new Date().toISOString();

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "Betaling fejlede");
      setProcessing(false);
    } else if (result.paymentIntent?.status === "requires_capture") {
      onSuccess(consentGivenAt);
      setProcessing(false);
    } else {
      setError("Uventet betalingsstatus. Kontakt support.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      <div className="mt-5 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1B7A6E] focus:ring-[#1B7A6E]"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            Jeg accepterer{" "}
            <a href="/handelsbetingelser" target="_blank" className="text-[#1B7A6E] underline">
              handelsbetingelserne
            </a>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptWaiver}
            onChange={(e) => setAcceptWaiver(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1B7A6E] focus:ring-[#1B7A6E]"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            Jeg anmoder om at ydelsen starter med det samme, og jeg er indforst&aring;et med at min fortrydelsesret bortfalder n&aring;r ydelsen er leveret
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`mt-4 w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg ${
          !canSubmit ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Behandler...
          </span>
        ) : (
          "Reserver 149 kr"
        )}
      </button>
    </form>
  );
}
