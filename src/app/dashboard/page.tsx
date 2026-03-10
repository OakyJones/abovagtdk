"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Inspektoeren from "@/components/Inspektoeren";
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

interface CompletedAction {
  type: "cancel" | "downgrade";
  serviceName: string;
  savings: number;
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

function DashboardContent() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected") === "true";
  const credentialsId = searchParams.get("credentialsId");
  const tinkCode = searchParams.get("code");
  const error = searchParams.get("error");

  const [step, setStep] = useState<"connect" | "scanning" | "results" | "confirmation">(
    connected ? "scanning" : "connect"
  );
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [unknowns, setUnknowns] = useState<Subscription[]>([]);
  const [scanError, setScanError] = useState<string | null>(error || null);
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const [downgradeTargets, setDowngradeTargets] = useState<Record<string, string>>({});

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // Modal state
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

  // Completed actions tracking
  const [completedActions, setCompletedActions] = useState<CompletedAction[]>([]);

  // Stripe payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("abovagt_user_id");
    const storedEmail = localStorage.getItem("abovagt_user_email");
    const storedName = localStorage.getItem("abovagt_user_name");
    if (stored) setUserId(stored);
    if (storedEmail) setUserEmail(storedEmail);
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    if (connected && userId && step === "scanning") {
      runScan();
    }
  }, [connected, userId, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    if (!userId) {
      window.location.href = "/connect";
      return;
    }

    try {
      const res = await fetch("/api/tink/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setScanError(
            "Tink bankforbindelse er ikke aktiveret endnu. Vi arbejder på det!"
          );
        } else {
          setScanError(data.error || "Kunne ikke oprette bankforbindelse");
        }
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

  // Dynamic savings
  const cancelledItems = allItems.filter((item) => actions[item.id] === "cancel");
  const downgradedItems = allItems.filter((item) => actions[item.id] === "downgrade");

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
  const hasDowngrade = (item: DashboardItem) =>
    item.lowerTiers.length > 0 || !!item.legacyDowngrade;

  const setAction = (id: string, action: ActionType) => {
    setActions((prev) => ({ ...prev, [id]: action }));
  };

  const setDowngradeTarget = (id: string, tierId: string) => {
    setDowngradeTargets((prev) => ({ ...prev, [id]: tierId }));
  };

  // Open cancel modal
  const openCancelModal = (item: DashboardItem) => {
    const serviceId = item.service?.id || "";
    const serviceName = item.service?.name || item.name;
    const cancellation = (item.cancellation || "løbende") as CancellationPeriod;

    const email = generateCancelEmail(serviceId, serviceName, userName || "Dit navn");
    const savingsFromDate = calculateSavingsFromDate(cancellation);

    setModal({
      isOpen: true,
      type: "cancel",
      item,
      emailSubject: email.subject,
      emailBody: email.body,
      toEmail: email.toEmail,
      cancelUrl: email.cancelUrl,
      savingsFromDate,
    });
    setSendError(null);
  };

  // Open downgrade modal
  const openDowngradeModal = (item: DashboardItem) => {
    const serviceId = item.service?.id || "";
    const serviceName = item.service?.name || item.name;
    const cancellation = (item.cancellation || "løbende") as CancellationPeriod;

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
      serviceId, serviceName, userName || "Dit navn", currentPlan, newPlan, newPrice
    );
    const savingsFromDate = calculateSavingsFromDate(cancellation);

    setModal({
      isOpen: true,
      type: "downgrade",
      item,
      emailSubject: email.subject,
      emailBody: email.body,
      toEmail: email.toEmail,
      cancelUrl: email.cancelUrl,
      savingsFromDate,
      selectedTier,
    });
    setSendError(null);
  };

  // Send cancellation/downgrade email
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
          userName: userName || "Bruger",
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

      // Track completed action
      const savings = modal.type === "cancel"
        ? modal.item.price
        : getDowngradeSavingsForItem(modal.item);

      setCompletedActions((prev) => [
        ...prev,
        {
          type: modal.type,
          serviceName: modal.item!.service?.name || modal.item!.name,
          savings,
        },
      ]);

      // Close modal
      setModal((prev) => ({ ...prev, isOpen: false }));
      setSending(false);
    } catch {
      setSendError("Kunne ikke sende email — prøv igen");
      setSending(false);
    }
  };

  // Go to confirmation page + create payment intent
  const goToConfirmation = async () => {
    setStep("confirmation");
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          totalSavings: totalCompletedSavings,
          completedActions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error || "Kunne ikke oprette betaling");
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

  // Confirm payment after successful Stripe capture
  const confirmPayment = async () => {
    if (!paymentIntentId || !userId) return;

    try {
      await fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          userId,
          completedActions,
          totalSavings: totalCompletedSavings,
        }),
      });
      setPaymentSuccess(true);
    } catch {
      // Payment was successful via Stripe, just couldn't save receipt
      setPaymentSuccess(true);
    }
  };

  // Confirmation page data
  const totalCompletedSavings = completedActions.reduce((sum, a) => sum + a.savings, 0);
  const cancelCount = completedActions.filter((a) => a.type === "cancel").length;
  const downgradeCount = completedActions.filter((a) => a.type === "downgrade").length;
  const fee = Math.min(Math.round(totalCompletedSavings * 0.25), 149);

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
        {/* Step: Connect bank */}
        {step === "connect" && (
          <div className="max-w-md mx-auto text-center">
            <Inspektoeren
              pose="searching"
              size={120}
              speechBubble="Lad mig finde dine abonnementer!"
              className="mb-6"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A] mb-3">
              Forbind din bank
            </h1>
            <p className="text-gray-600 mb-8">
              Vi forbinder sikkert via Tink. Vi kan kun læse dine transaktioner
              — aldrig flytte penge.
            </p>

            {scanError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-red-700">{scanError}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              className="w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
            >
              Forbind min bank
            </button>

            <div className="mt-8 space-y-3">
              {[
                "Sikker forbindelse via Tink (reguleret af Finanstilsynet)",
                "Kun læseadgang — vi kan aldrig flytte penge",
                "Dine data slettes når du vil",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-left">
                  <svg
                    className="w-5 h-5 text-[#1B7A6E] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Scanning */}
        {step === "scanning" && (
          <div className="max-w-md mx-auto text-center py-12">
            <Inspektoeren pose="searching" size={120} className="mb-6" />
            <h2 className="text-2xl font-bold text-[#1C2B2A] mb-3">
              Scanner dine transaktioner...
            </h2>
            <p className="text-gray-600 mb-8">
              Inspektøren leder efter abonnementer i dine banktransaktioner
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-3 border-[#1B7A6E] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Step: Results */}
        {step === "results" && (
          <div>
            {/* Header with Inspektøren */}
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
                Vælg hvad du vil gøre med hvert abonnement
              </p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Månedligt forbrug
                </p>
                <p className="text-3xl font-bold text-[#1C2B2A]">
                  {totalMonthly.toLocaleString("da-DK")} kr/md
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Årligt forbrug
                </p>
                <p className="text-3xl font-bold text-[#1C2B2A]">
                  {(totalMonthly * 12).toLocaleString("da-DK")} kr/år
                </p>
              </div>
              <div
                className={`rounded-2xl border-2 p-5 text-center transition-all ${
                  totalSavings > 0
                    ? "bg-teal-50 border-[#1B7A6E]"
                    : "bg-white border-gray-200"
                }`}
              >
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Din besparelse
                </p>
                <p
                  className={`text-3xl font-bold ${
                    totalSavings > 0 ? "text-[#1B7A6E]" : "text-[#1C2B2A]"
                  }`}
                >
                  {totalSavings.toLocaleString("da-DK")} kr/md
                </p>
              </div>
            </div>

            {/* Name input for emails */}
            {!userName && (cancelledItems.length > 0 || downgradedItems.length > 0) && (
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
            )}

            {/* All subscriptions with action buttons */}
            {allItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1C2B2A] mb-4">
                  Dine abonnementer
                </h2>
                <div className="space-y-3">
                  {allItems.map((item) => {
                    const action = actions[item.id] || "keep";
                    const canDowngrade = hasDowngrade(item);
                    const isCompleted = completedActions.some(
                      (a) => a.serviceName === (item.service?.name || item.name)
                    );

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border overflow-hidden transition-all ${
                          isCompleted
                            ? "border-green-300 bg-green-50/50"
                            : action === "cancel"
                            ? "border-red-300"
                            : action === "downgrade"
                            ? "border-orange-300"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <p
                                  className={`font-semibold ${
                                    isCompleted
                                      ? "text-green-700"
                                      : action === "cancel"
                                      ? "text-gray-400 line-through"
                                      : "text-[#1C2B2A]"
                                  }`}
                                >
                                  {item.name}
                                  {isCompleted && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      Sendt
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.transactionCount} transaktioner fundet
                                  {item.cancellation &&
                                    item.cancellation !== "løbende" && (
                                      <span className="ml-2 text-orange-600">
                                        {item.cancellation}
                                      </span>
                                    )}
                                  {!item.isKnown && (
                                    <span className="ml-2 text-orange-500">
                                      Muligt abonnement
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold ${
                                  action === "cancel"
                                    ? "text-gray-400 line-through"
                                    : "text-[#1C2B2A]"
                                }`}
                              >
                                {item.price} kr/md
                              </p>
                              {action === "cancel" && (
                                <p className="text-xs text-red-600 font-medium">
                                  Spar {item.price} kr/md
                                </p>
                              )}
                              {action === "downgrade" && (
                                <p className="text-xs text-orange-600 font-medium">
                                  Spar {getDowngradeSavingsForItem(item)} kr/md
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          {!isCompleted && (
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
                          )}

                          {/* Downgrade tier picker */}
                          {action === "downgrade" &&
                            item.lowerTiers.length > 0 &&
                            !isCompleted && (
                              <div className="mt-3 bg-orange-50 rounded-lg px-4 py-3 border border-orange-100">
                                <p className="text-xs text-orange-700 font-semibold mb-2">
                                  Vælg billigere plan:
                                </p>
                                <div className="space-y-1.5">
                                  {item.lowerTiers.map((tier) => {
                                    const isSelected =
                                      (downgradeTargets[item.id] ||
                                        item.lowerTiers[0].tierId) ===
                                      tier.tierId;
                                    return (
                                      <label
                                        key={tier.tierId}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                          isSelected
                                            ? "bg-orange-100 border border-orange-300"
                                            : "bg-white border border-gray-200 hover:bg-orange-50"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="radio"
                                            name={`downgrade-${item.id}`}
                                            checked={isSelected}
                                            onChange={() =>
                                              setDowngradeTarget(
                                                item.id,
                                                tier.tierId
                                              )
                                            }
                                            className="w-3.5 h-3.5 text-orange-500 focus:ring-orange-400"
                                          />
                                          <span className="text-sm text-gray-800">
                                            {item.service?.name} {tier.label}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {tier.price} kr/md
                                          </span>
                                        </div>
                                        <span className="text-xs font-bold text-orange-600">
                                          Spar {tier.savingsPerMonth} kr/md
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {/* Send downgrade email button */}
                                <button
                                  onClick={() => openDowngradeModal(item)}
                                  className="mt-3 w-full px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-all"
                                >
                                  Send nedgraderingsmail
                                </button>
                              </div>
                            )}

                          {/* Legacy downgrade info */}
                          {action === "downgrade" &&
                            item.lowerTiers.length === 0 &&
                            item.legacyDowngrade &&
                            !isCompleted && (
                              <div className="mt-3 bg-orange-50 rounded-lg px-3 py-2.5">
                                <div className="flex items-start gap-2">
                                  <svg
                                    className="w-4 h-4 text-orange-500 mt-0.5 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                  </svg>
                                  <p className="text-sm text-orange-700">
                                    <span className="font-medium">
                                      {item.legacyDowngrade.fromLabel}
                                    </span>
                                    {" → "}
                                    <span className="font-medium">
                                      {item.legacyDowngrade.toLabel}
                                    </span>
                                    {" — spar "}
                                    <span className="font-bold">
                                      {item.legacyDowngrade.savingsPerMonth} kr/md
                                    </span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => openDowngradeModal(item)}
                                  className="mt-2 w-full px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-all"
                                >
                                  Send nedgraderingsmail
                                </button>
                              </div>
                            )}

                          {/* Cancel action button */}
                          {action === "cancel" && !isCompleted && (
                            <div className="mt-3">
                              {item.cancellation &&
                                item.cancellation !== "løbende" && (
                                  <div className="bg-red-50 rounded-lg px-3 py-2.5 flex items-center gap-2 mb-2">
                                    <svg
                                      className="w-4 h-4 text-red-500 shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <p className="text-xs text-red-700">
                                      <span className="font-semibold">OBS:</span>{" "}
                                      {item.service?.name || item.name} har{" "}
                                      {item.cancellation} — du sparer fra{" "}
                                      {getCancellationDate(
                                        item.cancellation as CancellationPeriod
                                      )}
                                    </p>
                                  </div>
                                )}
                              <button
                                onClick={() => openCancelModal(item)}
                                className="w-full px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all"
                              >
                                Send opsigelsesmail
                              </button>
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
                <p className="text-lg font-semibold text-[#1C2B2A]">
                  Ingen abonnementer fundet
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Vi fandt ingen tilbagevendende betalinger i dine transaktioner
                </p>
              </div>
            )}

            {/* Dynamic savings summary */}
            {allItems.length > 0 && (
              <div className="bg-[#1C2B2A] text-white rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold mb-4 text-center">
                  Din samlede besparelse
                </h3>

                {cancelledItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-white/80">
                      Opsigelser:{" "}
                      <span className="font-bold text-white">
                        {cancelSavings.toLocaleString("da-DK")} kr/md
                      </span>
                      <span className="text-white/50 ml-1">
                        ({cancelledItems.length}{" "}
                        {cancelledItems.length === 1
                          ? "abonnement"
                          : "abonnementer"}
                        )
                      </span>
                    </p>
                    <div className="mt-1.5 space-y-1">
                      {cancelledItems.map((item) => (
                        <p
                          key={item.id}
                          className="text-xs text-white/50 pl-2"
                        >
                          {item.icon} {item.name}: {item.price} kr/md
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {downgradedItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-white/80">
                      Nedgraderinger:{" "}
                      <span className="font-bold text-[#4ECDC4]">
                        {downgradeSavings.toLocaleString("da-DK")} kr/md
                      </span>
                      <span className="text-white/50 ml-1">
                        ({downgradedItems.length}{" "}
                        {downgradedItems.length === 1
                          ? "abonnement"
                          : "abonnementer"}
                        )
                      </span>
                    </p>
                    <div className="mt-1.5 space-y-1">
                      {downgradedItems.map((item) => (
                        <p
                          key={item.id}
                          className="text-xs text-white/50 pl-2"
                        >
                          {item.icon} {item.name}: spar{" "}
                          {getDowngradeSavingsForItem(item)} kr/md
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-white/20 mt-4 pt-4 text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wider">
                    Samlet besparelse
                  </p>
                  <p className="text-4xl font-bold text-[#4ECDC4]">
                    {totalSavings.toLocaleString("da-DK")} kr/md
                  </p>
                  {totalSavings > 0 && (
                    <p className="text-sm text-white/50 mt-1">
                      = {(totalSavings * 12).toLocaleString("da-DK")} kr/år
                    </p>
                  )}
                </div>

                {totalSavings === 0 && (
                  <p className="text-center text-sm text-white/60 mt-2">
                    Vælg &quot;Opsig&quot; eller &quot;Nedgrader&quot; ovenfor
                    for at se din besparelse
                  </p>
                )}
              </div>
            )}

            {/* Pricing CTA */}
            {totalSavings > 0 && (() => {
              const priceFee = Math.min(Math.round(totalSavings * 0.25), 149);
              const kept = totalSavings - priceFee;
              return (
                <div className="relative bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-8 mb-8">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    Din pris
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5 mt-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Din besparelse
                        </span>
                        <span className="text-sm font-bold text-[#1C2B2A]">
                          {totalSavings.toLocaleString("da-DK")} kr/md
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Du betaler
                        </span>
                        <span className="text-sm font-bold text-[#1C2B2A]">
                          {priceFee.toLocaleString("da-DK")} kr (en gang)
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1B7A6E]">
                          Du beholder
                        </span>
                        <span className="text-lg font-bold text-[#1B7A6E]">
                          {kept.toLocaleString("da-DK")} kr/md — hver måned
                          fremover
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA: Go to confirmation if actions completed */}
                  {completedActions.length > 0 && (
                    <button
                      onClick={goToConfirmation}
                      className="mt-4 w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
                    >
                      Se din bekræftelse
                    </button>
                  )}

                  <p className="mt-4 text-center text-xs text-gray-500">
                    Ingen binding. Ingen skjulte gebyrer. Du betaler kun en
                    gang.
                  </p>
                </div>
              );
            })()}

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
                    <h3 className="text-lg font-bold text-[#1C2B2A] mb-1">
                      AboVagt Monitoring
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Vi scanner dine transaktioner kvartalsvis og giver dig besked
                      ved nye abonnementer eller prisændringer.
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-[#1C2B2A]">
                        15 kr/md
                      </span>
                      <span className="text-xs text-gray-500">
                        Kvartalsvis scanning &middot; Opsig når som helst
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back to home */}
            <div className="text-center">
              <a
                href="/"
                className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
              >
                &larr; Tilbage til forsiden
              </a>
            </div>
          </div>
        )}

        {/* Step: Confirmation + Payment */}
        {step === "confirmation" && (
          <div className="max-w-lg mx-auto">
            {/* Payment success */}
            {paymentSuccess ? (
              <div>
                <div className="text-center mb-8">
                  <Inspektoeren
                    pose="thumbsup"
                    size={120}
                    speechBubble="Perfekt! Du sparer penge fra nu af."
                    className="mb-4"
                  />
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                    Tak for din betaling!
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Kvittering er sendt til {userEmail || "din email"}.
                  </p>
                </div>

                <div className="bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 mb-6 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Din månedlige besparelse
                  </p>
                  <p className="text-4xl font-bold text-[#1B7A6E]">
                    {totalCompletedSavings.toLocaleString("da-DK")} kr/md
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    = {(totalCompletedSavings * 12).toLocaleString("da-DK")} kr/år
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                  <h2 className="text-sm font-bold text-[#1C2B2A] mb-3">
                    Opsummering
                  </h2>
                  {completedActions.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{a.serviceName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          a.type === "cancel" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {a.type === "cancel" ? "Opsagt" : "Nedgraderet"}
                        </span>
                        <span className="font-medium text-[#1B7A6E]">
                          -{a.savings} kr/md
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Betalt</span>
                    <span className="text-sm font-bold text-[#1C2B2A]">
                      {fee.toLocaleString("da-DK")} kr (reserveret)
                    </span>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-500 mb-6">
                  Beløbet er reserveret og trækkes først når besparelsen er bekræftet.
                </p>

                <div className="text-center">
                  <a
                    href="/"
                    className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
                  >
                    &larr; Tilbage til forsiden
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <Inspektoeren
                    pose="thumbsup"
                    size={120}
                    speechBubble="Godt klaret! Du sparer penge nu."
                    className="mb-4"
                  />
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                    Bekræftelse
                  </h1>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                  <h2 className="text-lg font-bold text-[#1C2B2A] mb-4">
                    Dine handlinger
                  </h2>

                  {cancelCount > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-red-600 mb-2">
                        Opsagt ({cancelCount} {cancelCount === 1 ? "abonnement" : "abonnementer"})
                      </p>
                      <div className="space-y-1.5">
                        {completedActions
                          .filter((a) => a.type === "cancel")
                          .map((a, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{a.serviceName}</span>
                              <span className="font-medium text-red-600">
                                -{a.savings} kr/md
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {downgradeCount > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-orange-600 mb-2">
                        Nedgraderet ({downgradeCount} {downgradeCount === 1 ? "abonnement" : "abonnementer"})
                      </p>
                      <div className="space-y-1.5">
                        {completedActions
                          .filter((a) => a.type === "downgrade")
                          .map((a, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{a.serviceName}</span>
                              <span className="font-medium text-orange-600">
                                -{a.savings} kr/md
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Estimeret besparelse</span>
                      <span className="text-lg font-bold text-[#1B7A6E]">
                        {totalCompletedSavings.toLocaleString("da-DK")} kr/md
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Årlig besparelse</span>
                      <span className="text-sm font-bold text-[#1C2B2A]">
                        {(totalCompletedSavings * 12).toLocaleString("da-DK")} kr/år
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Din pris</span>
                      <span className="text-sm font-bold text-[#1C2B2A]">
                        {fee.toLocaleString("da-DK")} kr (en gang, maks 149 kr)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stripe Payment */}
                {paymentLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#1B7A6E] border-t-transparent rounded-full animate-spin" />
                    <span className="ml-3 text-sm text-gray-500">Opretter betaling...</span>
                  </div>
                )}

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                )}

                {clientSecret && !paymentLoading && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                    <h3 className="text-sm font-bold text-[#1C2B2A] mb-4">
                      Kortbetaling
                    </h3>
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#1B7A6E",
                            borderRadius: "8px",
                          },
                        },
                        locale: "da",
                      }}
                    >
                      <CheckoutForm
                        fee={fee}
                        onSuccess={confirmPayment}
                      />
                    </Elements>
                  </div>
                )}

                <p className="text-center text-xs text-gray-500 mb-6">
                  Beløbet reserveres og trækkes først når besparelsen er bekræftet.
                  Ingen binding. Du betaler kun en gang.
                </p>

                <div className="text-center">
                  <button
                    onClick={() => setStep("results")}
                    className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
                  >
                    &larr; Tilbage til dine abonnementer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel/Downgrade Email Modal */}
      {modal.isOpen && modal.item && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !sending && setModal((prev) => ({ ...prev, isOpen: false }))}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
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
                    {modal.item.service?.name || modal.item.name} har{" "}
                    {modal.item.cancellation} — du sparer fra{" "}
                    <span className="font-semibold">
                      {getCancellationDate(modal.item.cancellation as CancellationPeriod)}
                    </span>
                  </p>
                </div>
              )}

              {/* Cancel URL link */}
              {modal.cancelUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-blue-800 mb-1">
                    Du kan også opsige direkte:
                  </p>
                  <a
                    href={modal.cancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {modal.cancelUrl}
                  </a>
                </div>
              )}

              {/* Email preview */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Emne
                </label>
                <input
                  type="text"
                  value={modal.emailSubject}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, emailSubject: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1B7A6E] focus:ring-1 focus:ring-[#1B7A6E] outline-none text-sm"
                  disabled={sending}
                />
              </div>

              {modal.toEmail && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Til
                  </label>
                  <input
                    type="email"
                    value={modal.toEmail}
                    onChange={(e) =>
                      setModal((prev) => ({ ...prev, toEmail: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1B7A6E] focus:ring-1 focus:ring-[#1B7A6E] outline-none text-sm"
                    disabled={sending}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email-indhold
                </label>
                <textarea
                  value={modal.emailBody}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, emailBody: e.target.value }))
                  }
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

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => !sending && setModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all text-sm"
                disabled={sending}
              >
                Annuller
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-lg transition-all text-sm ${
                  modal.type === "cancel"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-orange-500 hover:bg-orange-600"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Stripe Checkout Form component */
function CheckoutForm({ fee, onSuccess }: { fee: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "Betaling fejlede");
      setProcessing(false);
    } else if (result.paymentIntent?.status === "requires_capture") {
      // Success! Payment is authorized (delayed capture)
      onSuccess();
      setProcessing(false);
    } else {
      setError("Uventet betalingsstatus. Kontakt support.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`mt-4 w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg ${
          processing ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Behandler...
          </span>
        ) : (
          `Betal ${fee.toLocaleString("da-DK")} kr`
        )}
      </button>
    </form>
  );
}
