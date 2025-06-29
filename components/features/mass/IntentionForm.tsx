import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../glass/Input";
import { Button } from "../glass/Button";
import { motion } from "framer-motion";

const intentionSchema = z.object({
  intention: z
    .string()
    .min(1, "Intention is required")
    .max(500, "Intention cannot exceed 500 characters"),
  type: z.enum(["individual", "collective"]),
  offerer: z.string().min(1, "Please provide your name"),
  contact: z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
  }),
});

type IntentionFormData = z.infer<typeof intentionSchema>;

interface IntentionFormProps {
  value: IntentionFormData;
  onComplete: (data: IntentionFormData) => void;
}

export const IntentionForm: React.FC<IntentionFormProps> = ({
  value,
  onComplete,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntentionFormData>({
    resolver: zodResolver(intentionSchema),
    defaultValues: value,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit(onComplete)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Type of Mass
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={value.type === "individual" ? "primary" : "secondary"}
                onClick={() =>
                  register("type").onChange({ target: { value: "individual" } })
                }
              >
                Individual
              </Button>
              <Button
                type="button"
                variant={value.type === "collective" ? "primary" : "secondary"}
                onClick={() =>
                  register("type").onChange({ target: { value: "collective" } })
                }
              >
                Collective
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Intention
            </label>
            <textarea
              {...register("intention")}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400
                focus:ring-2 focus:ring-gold-400 focus:border-transparent backdrop-blur-md"
              rows={4}
              placeholder="Enter your intention..."
            />
            {errors.intention && (
              <p className="mt-1 text-sm text-red-500">
                {errors.intention.message}
              </p>
            )}
          </div>

          <Input
            label="Your Name"
            {...register("offerer")}
            error={errors.offerer?.message}
            placeholder="Enter your full name"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              {...register("contact.email")}
              error={errors.contact?.email?.message}
              placeholder="Enter your email"
            />
            <Input
              label="Phone (optional)"
              type="tel"
              {...register("contact.phone")}
              error={errors.contact?.phone?.message}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </motion.div>
  );
};

export default IntentionForm;
