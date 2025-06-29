import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MassIntention, MassBookingResponse, Church } from "./types";
import { z } from "zod";

export class MassOrderingService {
  private supabase = createClientComponentClient();

  async getAvailableChurches(params: {
    city?: string;
    date?: Date;
  }): Promise<Church[]> {
    let query = this.supabase
      .from("churches")
      .select("*")
      .eq("is_active", true);

    if (params.city) {
      query = query.ilike("city", `%${params.city}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getAvailableHours(params: {
    churchId: string;
    date: Date;
  }): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("mass_schedules")
      .select("time")
      .eq("church_id", params.churchId)
      .eq("date", params.date.toISOString().split("T")[0])
      .eq("is_available", true)
      .order("time");

    if (error) throw error;
    return data.map((schedule) => schedule.time);
  }

  async createMassBooking(
    intention: MassIntention
  ): Promise<MassBookingResponse> {
    try {
      // Validate intention data
      const validatedData = await MassIntentionSchema.parseAsync(intention);

      // Start a transaction
      const { data: booking, error: bookingError } = await this.supabase
        .from("mass_intentions")
        .insert({
          church_id: validatedData.churchId,
          date: validatedData.date,
          time: validatedData.time,
          intention: validatedData.intention,
          type: validatedData.type,
          offerer: validatedData.offerer,
          contact: validatedData.contact,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment
      const { data: payment, error: paymentError } = await this.supabase
        .from("payments")
        .insert({
          intention_id: booking.id,
          amount: validatedData.payment.amount,
          currency: validatedData.payment.currency,
          method: validatedData.payment.method,
          status: "pending",
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Create payment URL using Stripe or other payment provider
      const paymentUrl = await this.createPaymentUrl(
        payment.id,
        validatedData.payment
      );

      return {
        success: true,
        data: {
          bookingId: booking.id,
          confirmationCode: this.generateConfirmationCode(booking.id),
          paymentUrl,
        },
      };
    } catch (error) {
      console.error("Error creating mass booking:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private generateConfirmationCode(bookingId: string): string {
    return `MS-${bookingId.slice(0, 8).toUpperCase()}`;
  }

  private async createPaymentUrl(
    paymentId: string,
    paymentDetails: MassIntention["payment"]
  ): Promise<string> {
    // Implementation depends on payment provider (Stripe, PayU, etc.)
    // This is a placeholder
    return `/api/payments/${paymentId}/checkout`;
  }
}
