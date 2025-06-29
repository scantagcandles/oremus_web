import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "../glass/Button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/useToast";

interface PaymentSectionProps {
  orderData: any; // Replace with proper type
  onComplete: (paymentData: { paymentMethod: string }) => void;
  isLoading?: boolean;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  orderData,
  onComplete,
  isLoading = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState("card");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      onComplete({ paymentMethod: selectedMethod });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Payment processing failed",
        type: "error",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-white/5 rounded-lg p-4 backdrop-blur-md">
        <h3 className="text-lg font-medium mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Mass Intention:</span>
            <span className="font-medium">{orderData.intention}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">
              {new Date(orderData.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-medium">{orderData.time}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={selectedMethod === "card" ? "primary" : "secondary"}
            onClick={() => setSelectedMethod("card")}
          >
            Card
          </Button>
          <Button
            variant={selectedMethod === "blik" ? "primary" : "secondary"}
            onClick={() => setSelectedMethod("blik")}
          >
            BLIK
          </Button>
          <Button
            variant={selectedMethod === "transfer" ? "primary" : "secondary"}
            onClick={() => setSelectedMethod("transfer")}
          >
            Transfer
          </Button>
        </div>

        {selectedMethod === "card" && stripe && elements && (
          <div className="mt-4">
            <PaymentElement />
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !stripe}
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Complete Payment"}
      </Button>
    </motion.div>
  );
};

export default PaymentSection;
