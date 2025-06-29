import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { massOrderingService } from "@/services/massOrderingService";
import { GlassPanel } from "../glass/GlassPanel";
import { Input } from "../glass/Input";
import { Button } from "../glass/Button";
import { motion, AnimatePresence } from "framer-motion";

interface ChurchSelectorProps {
  initialLocation?: { city?: string };
  value: string;
  onComplete: (churchId: string) => void;
}

export const ChurchSelector: React.FC<ChurchSelectorProps> = ({
  initialLocation,
  value,
  onComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChurch, setSelectedChurch] = useState(value);

  const { data: churches, isLoading } = useQuery({
    queryKey: ["churches", searchQuery],
    queryFn: () =>
      massOrderingService.getAvailableChurches({ city: searchQuery }),
  });

  useEffect(() => {
    if (initialLocation?.city && !searchQuery) {
      setSearchQuery(initialLocation.city);
    }
  }, [initialLocation]);

  const handleSubmit = () => {
    if (selectedChurch) {
      onComplete(selectedChurch);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Search churches by city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter city name..."
        />

        <div className="h-80 overflow-y-auto space-y-2">
          <AnimatePresence>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <svg
                  className="animate-spin h-8 w-8 text-gold-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              churches?.map((church) => (
                <motion.div
                  key={church.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassPanel
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      selectedChurch === church.id
                        ? "ring-2 ring-gold-400"
                        : "hover:bg-white/20"
                    }`}
                    onClick={() => setSelectedChurch(church.id)}
                  >
                    <h3 className="font-medium">{church.name}</h3>
                    <p className="text-sm text-gray-300">{church.address}</p>
                  </GlassPanel>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedChurch}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
};

export default ChurchSelector;
