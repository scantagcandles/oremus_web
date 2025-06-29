"use client";

import React, { useState, useEffect } from "react";
import {
  massOrderingService,
  MassOrderData,
} from "../../../services/mass/MassOrderingService";
import { useFeatureFlags } from "../../../hooks/useFeatureFlags";

// Typy danych
interface City {
  id: string;
  name: string;
  voivodeship: string;
}

interface Church {
  id: string;
  name: string;
  address: string;
  cityId: string;
  phone?: string;
  massPrice: number; // Cena mszy ustawiona przez parafię
  currency: string;
}

interface MassTime {
  id: string;
  time: string;
  available: boolean;
  reserved?: boolean;
}

interface CalendarDay {
  date: string;
  times: MassTime[];
  hasAvailability: boolean;
}

// 50 największych miast Polski
const polishCities: City[] = [
  { id: "1", name: "Warszawa", voivodeship: "mazowieckie" },
  { id: "2", name: "Kraków", voivodeship: "małopolskie" },
  { id: "3", name: "Łódź", voivodeship: "łódzkie" },
  { id: "4", name: "Wrocław", voivodeship: "dolnośląskie" },
  { id: "5", name: "Poznań", voivodeship: "wielkopolskie" },
  { id: "6", name: "Gdańsk", voivodeship: "pomorskie" },
  { id: "7", name: "Szczecin", voivodeship: "zachodniopomorskie" },
  { id: "8", name: "Bydgoszcz", voivodeship: "kujawsko-pomorskie" },
  { id: "9", name: "Lublin", voivodeship: "lubelskie" },
  { id: "10", name: "Białystok", voivodeship: "podlaskie" },
  { id: "11", name: "Katowice", voivodeship: "śląskie" },
  { id: "12", name: "Gdynia", voivodeship: "pomorskie" },
  { id: "13", name: "Częstochowa", voivodeship: "śląskie" },
  { id: "14", name: "Radom", voivodeship: "mazowieckie" },
  { id: "15", name: "Sosnowiec", voivodeship: "śląskie" },
  { id: "16", name: "Toruń", voivodeship: "kujawsko-pomorskie" },
  { id: "17", name: "Kielce", voivodeship: "świętokrzyskie" },
  { id: "18", name: "Gliwice", voivodeship: "śląskie" },
  { id: "19", name: "Zabrze", voivodeship: "śląskie" },
  { id: "20", name: "Bytom", voivodeship: "śląskie" },
  { id: "21", name: "Olsztyn", voivodeship: "warmińsko-mazurskie" },
  { id: "22", name: "Bielsko-Biała", voivodeship: "śląskie" },
  { id: "23", name: "Rzeszów", voivodeship: "podkarpackie" },
  { id: "24", name: "Ruda Śląska", voivodeship: "śląskie" },
  { id: "25", name: "Rybnik", voivodeship: "śląskie" },
  { id: "26", name: "Tychy", voivodeship: "śląskie" },
  { id: "27", name: "Dąbrowa Górnicza", voivodeship: "śląskie" },
  { id: "28", name: "Płock", voivodeship: "mazowieckie" },
  { id: "29", name: "Elbląg", voivodeship: "warmińsko-mazurskie" },
  { id: "30", name: "Opole", voivodeship: "opolskie" },
  { id: "31", name: "Wałbrzych", voivodeship: "dolnośląskie" },
  { id: "32", name: "Włocławek", voivodeship: "kujawsko-pomorskie" },
  { id: "33", name: "Tarnów", voivodeship: "małopolskie" },
  { id: "34", name: "Chorzów", voivodeship: "śląskie" },
  { id: "35", name: "Kalisz", voivodeship: "wielkopolskie" },
  { id: "36", name: "Koszalin", voivodeship: "zachodniopomorskie" },
  { id: "37", name: "Legnica", voivodeship: "dolnośląskie" },
  { id: "38", name: "Grudziądz", voivodeship: "kujawsko-pomorskie" },
  { id: "39", name: "Słupsk", voivodeship: "pomorskie" },
  { id: "40", name: "Jaworzno", voivodeship: "śląskie" },
  { id: "41", name: "Jastrzębie-Zdrój", voivodeship: "śląskie" },
  { id: "42", name: "Nowy Sącz", voivodeship: "małopolskie" },
  { id: "43", name: "Jelenia Góra", voivodeship: "dolnośląskie" },
  { id: "44", name: "Siedlce", voivodeship: "mazowieckie" },
  { id: "45", name: "Mysłowice", voivodeship: "śląskie" },
  { id: "46", name: "Konin", voivodeship: "wielkopolskie" },
  { id: "47", name: "Piła", voivodeship: "wielkopolskie" },
  { id: "48", name: "Inowrocław", voivodeship: "kujawsko-pomorskie" },
  { id: "49", name: "Lubin", voivodeship: "dolnośląskie" },
  { id: "50", name: "Ostrowiec Świętokrzyski", voivodeship: "świętokrzyskie" },
];

// Mock danych kościołów dla każdego miasta
const generateChurchesForCity = (
  cityId: string,
  cityName: string
): Church[] => {
  const commonChurchNames = [
    "Parafia Najświętszego Serca Jezusowego",
    "Parafia św. Jana Chrzciciela",
    "Parafia Matki Boskiej Częstochowskiej",
    "Parafia św. Józefa",
    "Parafia św. Antoniego",
    "Katedra św. Michała Archanioła",
    "Parafia św. Floriana",
    "Parafia Ducha Świętego",
    "Parafia św. Stanisława",
    "Bazylika Najświętszej Maryi Panny",
  ];

  return commonChurchNames
    .slice(0, Math.floor(Math.random() * 5) + 3)
    .map((name, index) => ({
      id: `${cityId}-${index + 1}`,
      name: name,
      address: `ul. ${
        ["Kościelna", "Rynek", "Główna", "Słowackiego", "Mickiewicza"][
          index % 5
        ]
      } ${Math.floor(Math.random() * 50) + 1}`,
      cityId: cityId,
      phone: `+48 ${Math.floor(Math.random() * 900) + 100} ${
        Math.floor(Math.random() * 900) + 100
      } ${Math.floor(Math.random() * 900) + 100}`,
      massPrice: [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)], // Różne ceny mszy (10-30 PLN)
      currency: "PLN",
    }));
};

// Komponenty pomocnicze
const ModernLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">{children}</div>
);

const GlassCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 ${className}`}
  >
    {children}
  </div>
);

const useToast = () => ({
  showToast: (message: string, type: "success" | "error" = "success") => {
    console.log(`Toast (${type}): ${message}`);
    alert(`${type.toUpperCase()}: ${message}`);
  },
});

// Komponenty kalendarza
const Calendar = ({
  availableDays,
  selectedDate,
  onDateSelect,
}: {
  availableDays: CalendarDay[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Puste dni przed rozpoczęciem miesiąca
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Dni miesiąca
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const dayInfo = availableDays.find((d) => d.date === dateString);
      days.push({
        day,
        dateString,
        hasAvailability: dayInfo?.hasAvailability || false,
        isSelected: dateString === selectedDate,
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Nagłówek kalendarza */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
        >
          →
        </button>
      </div>

      {/* Dni tygodnia */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"].map((day) => (
          <div
            key={day}
            className="p-2 text-sm font-medium text-center text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dni miesiąca */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2"></div>;
          }

          return (
            <button
              key={day.dateString}
              type="button"
              onClick={() =>
                day.hasAvailability && onDateSelect(day.dateString)
              }
              disabled={!day.hasAvailability}
              className={`p-2 text-sm rounded transition-colors ${
                day.isSelected
                  ? "bg-blue-600 text-white"
                  : day.hasAvailability
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              {day.day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>Dostępne terminy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Wybrana data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrderMassScreen() {
  const [formData, setFormData] = useState<Partial<MassOrderData>>({
    intention: "",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    massDate: "",
    preferredTime: "",
    church: "",
    amount: 0,
  });

  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedChurchId, setSelectedChurchId] = useState<string>("");
  const [availableChurches, setAvailableChurches] = useState<Church[]>([]);
  const [availableDays, setAvailableDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const { showToast } = useToast();
  const featureFlags = useFeatureFlags();

  // Ładowanie kościołów po wybraniu miasta
  useEffect(() => {
    if (selectedCityId) {
      const selectedCity = polishCities.find(
        (city) => city.id === selectedCityId
      );
      if (selectedCity) {
        const churches = generateChurchesForCity(
          selectedCityId,
          selectedCity.name
        );
        setAvailableChurches(churches);
      }
    } else {
      setAvailableChurches([]);
    }

    // Reset church selection and form data
    setSelectedChurchId("");
    setAvailableDays([]);
    setSelectedDate("");
    setSelectedTime("");
    setFormData((prev) => ({ ...prev, amount: 0, church: "" }));
  }, [selectedCityId]);

  // Ładowanie kalendarza po wybraniu kościoła
  useEffect(() => {
    if (selectedChurchId) {
      fetchAvailableDates(selectedChurchId);

      // Ustaw cenę mszy z wybranego kościoła
      const church = availableChurches.find((c) => c.id === selectedChurchId);
      if (church) {
        setFormData((prev) => ({
          ...prev,
          amount: church.massPrice,
          church: church.name,
        }));
      }
    } else {
      setAvailableDays([]);
      setSelectedDate("");
      setSelectedTime("");
      setFormData((prev) => ({ ...prev, amount: 0, church: "" }));
    }
  }, [selectedChurchId, availableChurches]);

  const fetchAvailableDates = async (churchId: string) => {
    setLoadingCalendar(true);

    // Symulacja API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const calendarDays: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split("T")[0];

      // Pomiń niedziele dla większości dni (90% przypadków)
      const isSunday = date.getDay() === 0;
      if (isSunday && Math.random() > 0.1) continue;

      // Losowa dostępność (70% szans na dostępne terminy)
      const hasAvailability = Math.random() > 0.3;

      if (hasAvailability) {
        const times: MassTime[] = [
          {
            id: `${dateString}-6`,
            time: "06:00",
            available: Math.random() > 0.4,
          },
          {
            id: `${dateString}-7`,
            time: "07:00",
            available: Math.random() > 0.2,
          },
          {
            id: `${dateString}-8`,
            time: "08:00",
            available: Math.random() > 0.3,
          },
          {
            id: `${dateString}-17`,
            time: "17:00",
            available: Math.random() > 0.3,
          },
          {
            id: `${dateString}-18`,
            time: "18:00",
            available: Math.random() > 0.2,
          },
          {
            id: `${dateString}-19`,
            time: "19:00",
            available: Math.random() > 0.4,
          },
        ].filter((time) => time.available);

        if (times.length > 0) {
          calendarDays.push({
            date: dateString,
            times: times,
            hasAvailability: true,
          });
        }
      }
    }

    setAvailableDays(calendarDays);
    setLoadingCalendar(false);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setFormData((prev) => ({
      ...prev,
      massDate: selectedDate,
      preferredTime: time,
    }));
  };

  const handleInputChange = (
    field: keyof MassOrderData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Walidacja
      if (!formData.intention || !formData.donorName || !formData.donorEmail) {
        showToast("Proszę wypełnić wszystkie wymagane pola", "error");
        return;
      }

      if (!selectedCityId || !selectedChurchId) {
        showToast("Proszę wybrać miasto i kościół", "error");
        return;
      }

      if (!selectedDate || !selectedTime) {
        showToast("Proszę wybrać datę i godzinę mszy", "error");
        return;
      }

      // Symulacja wysłania zamówienia
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showToast("Zamówienie mszy zostało wysłane pomyślnie!", "success");

      // Reset formularza
      setFormData({
        intention: "",
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        massDate: "",
        preferredTime: "",
        church: "",
        amount: 0,
      });
      setSelectedCityId("");
      setSelectedChurchId("");
      setSelectedDate("");
      setSelectedTime("");
      setAvailableDays([]);
    } catch (error) {
      showToast("Wystąpił błąd podczas składania zamówienia", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedCity = polishCities.find((city) => city.id === selectedCityId);
  const selectedChurch = availableChurches.find(
    (church) => church.id === selectedChurchId
  );
  const selectedDayData = availableDays.find(
    (day) => day.date === selectedDate
  );

  return (
    <ModernLayout>
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">
            Zamów Mszę Świętą
          </h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Lewa kolumna - Wybór miejsca */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-800">
                  Wybierz miejsce
                </h3>

                {/* Dropdown miasta */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Miasto *
                  </label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Wybierz miasto --</option>
                    {polishCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name} ({city.voivodeship})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dropdown kościołów */}
                {selectedCityId && (
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Kościół *
                    </label>
                    <select
                      value={selectedChurchId}
                      onChange={(e) => setSelectedChurchId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Wybierz kościół --</option>
                      {availableChurches.map((church) => (
                        <option key={church.id} value={church.id}>
                          {church.name}
                        </option>
                      ))}
                    </select>

                    {selectedChurch && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>📍 {selectedChurch.address}</p>
                        {selectedChurch.phone && (
                          <p>📞 {selectedChurch.phone}</p>
                        )}
                        <p className="font-medium text-blue-600">
                          💰 Ofiara mszalna: {selectedChurch.massPrice}{" "}
                          {selectedChurch.currency}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Środkowa kolumna - Kalendarz */}
            <div className="lg:col-span-1">
              {selectedChurchId && (
                <GlassCard className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Wybierz datę
                  </h3>

                  {loadingCalendar ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <span className="ml-3">Ładowanie kalendarza...</span>
                    </div>
                  ) : (
                    <Calendar
                      availableDays={availableDays}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                    />
                  )}
                </GlassCard>
              )}
            </div>

            {/* Prawa kolumna - Godziny i formularz */}
            <div className="lg:col-span-1">
              {selectedDate && selectedDayData && (
                <GlassCard className="p-6 mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Wybierz godzinę
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "pl-PL",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedDayData.times.map((timeSlot) => (
                      <button
                        key={timeSlot.id}
                        type="button"
                        onClick={() => handleTimeSelect(timeSlot.time)}
                        className={`px-3 py-2 rounded-md text-sm transition-all ${
                          selectedTime === timeSlot.time
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {timeSlot.time}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Formularz zamówienia */}
              {selectedDate && selectedTime && (
                <GlassCard className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Dane zamówienia
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Podsumowanie */}
                    <div className="p-3 text-sm rounded-lg bg-blue-50">
                      <p>
                        <strong>{selectedChurch?.name}</strong>
                      </p>
                      <p>
                        {new Date(
                          selectedDate + "T00:00:00"
                        ).toLocaleDateString("pl-PL")}{" "}
                        o {selectedTime}
                      </p>
                      <p className="mt-1 font-medium text-blue-600">
                        Ofiara mszalna: {selectedChurch?.massPrice}{" "}
                        {selectedChurch?.currency}
                      </p>
                    </div>

                    {/* Intencja */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Intencja mszalna *
                      </label>
                      <textarea
                        value={formData.intention || ""}
                        onChange={(e) =>
                          handleInputChange("intention", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Podaj intencję..."
                        required
                      />
                    </div>

                    {/* Dane osobowe */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Imię i nazwisko *
                      </label>
                      <input
                        type="text"
                        value={formData.donorName || ""}
                        onChange={(e) =>
                          handleInputChange("donorName", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.donorEmail || ""}
                        onChange={(e) =>
                          handleInputChange("donorEmail", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.donorPhone || ""}
                        onChange={(e) =>
                          handleInputChange("donorPhone", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Ofiara - tylko do wyświetlenia, nie do edycji */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Ofiara mszalna
                      </label>
                      <div className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md">
                        {selectedChurch?.massPrice} {selectedChurch?.currency}
                        <span className="ml-2 text-xs text-gray-500">
                          (ustalone przez parafię)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Cena jest ustalana przez każdą parafię indywidualnie i
                        może być zmieniona przez administratora parafii.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-md font-medium transition-colors text-sm ${
                        loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {loading ? "Wysyłanie..." : "Zamów Mszę"}
                    </button>
                  </form>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
