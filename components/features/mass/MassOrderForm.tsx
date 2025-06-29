"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { ChurchSelector } from "./ChurchSelector";
import { DateTimePicker } from "./DateTimePicker";
import { IntentionForm } from "./IntentionForm";
import { PaymentSection } from "./PaymentSection";
import { GlassPanel } from "../glass/GlassPanel";
import { Button } from "../glass/Button";
import { useToast } from "@/hooks/useToast";
import { massOrderingService } from "@/services/massOrderingService";

export default function MassOrderForm() {
  const { user } = useAuth();
  const { location } = useGeoLocation();
  const { isFeatureEnabled } = useFeatureFlags();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    churchId: "",
    date: null,
    time: "",
    intention: "",
    type: "individual",
    offerer: user?.full_name || "",
    contact: {
      email: user?.email || "",
      phone: user?.phone || "",
    },
    paymentMethod: "card",
  });

  const handleStepComplete = async (stepData: Partial<typeof orderData>) => {
    setOrderData((prev) => ({ ...prev, ...stepData }));

    if (step === 4) {
      await handleSubmit();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await massOrderingService.createMassOrder(orderData);
      if (result.success && result.data) {
        showToast({
          message: "Mass intention submitted successfully!",
          type: "success",
        });
        if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to submit intention",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const modernDesign = isFeatureEnabled("modernDesignEnabled");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassPanel
        className={modernDesign ? "backdrop-blur-lg bg-white/10" : ""}
      >
        <div className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Order a Mass Intention
          </h1>

          {step === 1 && (
            <ChurchSelector
              initialLocation={location}
              value={orderData.churchId}
              onComplete={(churchId) => handleStepComplete({ churchId })}
            />
          )}

          {step === 2 && (
            <DateTimePicker
              churchId={orderData.churchId}
              value={{ date: orderData.date, time: orderData.time }}
              onComplete={(dateTime) => handleStepComplete(dateTime)}
            />
          )}

          {step === 3 && (
            <IntentionForm
              value={{
                intention: orderData.intention,
                type: orderData.type,
                offerer: orderData.offerer,
                contact: orderData.contact,
              }}
              onComplete={(intentionData) => handleStepComplete(intentionData)}
            />
          )}

          {step === 4 && (
            <PaymentSection
              orderData={orderData}
              onComplete={(paymentData) => handleStepComplete(paymentData)}
              isLoading={loading}
            />
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={() => setStep((prev) => prev - 1)}
                disabled={loading}
              >
                Back
              </Button>
            )}

            {step < 4 && (
              <Button
                variant="primary"
                onClick={() => setStep((prev) => prev + 1)}
                disabled={!orderData.churchId && step === 1}
                className="ml-auto"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
