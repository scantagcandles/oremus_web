import { supabase } from "@/lib/supabase/client";
import {
  AuthResponse,
  PasswordValidation,
  ResetPasswordData,
  UserProfile,
} from "@/types/auth";

export type AuthProvider =
  | "google"
  | "facebook"
  | "apple"
  | "microsoft"
  | "github"
  | "twitter"
  | "linkedin"
  | "instagram" // custom OAuth
  | "tiktok" // custom OAuth
  | "email";

export class AuthService {
  private supabase = supabase;

  validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push(
        "Password must contain at least one special character (!@#$%^&*)"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update last login
      await this.updateLastLogin(data.user.id);

      const profile = await this.getUserProfile(data.user.id);
      return {
        success: true,
        user: profile,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An error occurred during sign in",
        },
      };
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const validation = this.validatePassword(password);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            message: validation.errors.join(". "),
          },
        };
      }

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile tylko jeśli user istnieje
      if (data.user) {
        await this.createUserProfile(data.user.id, email);
      }

      return {
        success: true,
        message: "Please check your email to verify your account",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An error occurred during sign up",
        },
      };
    }
  }

  async signUpWithMetadata(
    email: string,
    password: string,
    metadata?: any
  ): Promise<AuthResponse> {
    try {
      const validation = this.validatePassword(password);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            message: validation.errors.join(". "),
          },
        };
      }

      // Przygotuj display_name na podstawie metadanych
      const displayName = this.prepareDisplayName(metadata, email);

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            account_type: metadata?.accountType || "user",
            ...metadata,
          },
        },
      });

      if (error) throw error;

      // Create user profile z dodatkowymi danymi
      if (data.user && metadata) {
        await this.createExtendedUserProfile(data.user.id, metadata, email);
      } else if (data.user) {
        await this.createUserProfile(data.user.id, email);
      }

      return {
        success: true,
        message: "Please check your email to verify your account",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An error occurred during sign up",
        },
      };
    }
  }

  // Pomocnicza metoda do przygotowania display_name
  private prepareDisplayName(metadata: any, email: string): string {
    if (metadata?.accountType === "parish" && metadata?.parishName) {
      return metadata.parishName;
    } else if (metadata?.firstName && metadata?.lastName) {
      return `${metadata.firstName} ${metadata.lastName}`;
    } else if (metadata?.firstName) {
      return metadata.firstName;
    } else {
      return email.split("@")[0]; // Użyj części emaila przed @
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    try {
      if (data.token && data.newPassword) {
        const validation = this.validatePassword(data.newPassword);
        if (!validation.isValid) {
          return {
            success: false,
            error: {
              message: validation.errors.join(". "),
            },
          };
        }

        const { error } = await this.supabase.auth.updateUser({
          password: data.newPassword,
        });

        if (error) throw error;

        return {
          success: true,
          message: "Password has been successfully reset",
        };
      } else {
        const { error } = await this.supabase.auth.resetPasswordForEmail(
          data.email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

        if (error) throw error;

        return {
          success: true,
          message: "Password reset instructions have been sent to your email",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An error occurred during password reset",
        },
      };
    }
  }

  // Making this method public
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // Jeśli profil nie istnieje, utwórz go
        if (error.code === "PGRST116") {
          await this.createUserProfile(userId);
          return this.getUserProfile(userId);
        }
        throw error;
      }

      const { data: userData } = await this.supabase.auth.getUser();

      return {
        ...userData.user!,
        ...data,
        role: data.role || "user",
        isEmailVerified: data.is_email_verified || false,
        twoFactorEnabled: data.two_factor_enabled || false,
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  private async createUserProfile(
    userId: string,
    email?: string
  ): Promise<void> {
    try {
      console.log("Creating basic profile for user:", userId);

      // Dopasowane do struktury tabeli user_profiles (z display_name)
      const profileData = {
        user_id: userId,
        display_name: email ? email.split("@")[0] : "User",
        role: "user",
        notifications_enabled: true,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("user_profiles")
        .insert(profileData);

      if (error) {
        console.error("Basic profile creation error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        // Ignoruj błąd jeśli profil już istnieje
        if (error.code !== "23505") {
          console.warn("Non-duplicate error creating basic profile:", error);
        }
      } else {
        console.log("Basic profile created successfully:", data);
      }
    } catch (error) {
      console.error("Exception creating user profile:", error);
      // Nie rzucaj błędu
    }
  }

  private async createExtendedUserProfile(
    userId: string,
    metadata: any,
    email: string
  ): Promise<void> {
    try {
      console.log(
        "Creating extended profile for user:",
        userId,
        "with metadata:",
        metadata
      );

      // Przygotuj display_name
      const displayName = this.prepareDisplayName(metadata, email);

      // Podstawowy profil użytkownika - DOPASOWANY DO STRUKTURY TABELI
      const profileData = {
        user_id: userId,
        display_name: displayName,
        phone: metadata.phone || null,
        parish: metadata.accountType === "parish" ? metadata.parishName : null,
        role: metadata.accountType === "parish" ? "parish" : "user",
        notifications_enabled: true,
        created_at: new Date().toISOString(),
      };

      console.log("Attempting to insert profile data:", profileData);

      const { data, error: profileError } = await this.supabase
        .from("user_profiles")
        .insert(profileData);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        console.error("Error code:", profileError.code);
        console.error("Error message:", profileError.message);
        console.error("Error details:", profileError.details);

        // Nie rzucaj błędu jeśli profil już istnieje
        if (profileError.code !== "23505") {
          console.warn("Non-duplicate error creating profile:", profileError);
        }
      } else {
        console.log("Profile created successfully:", data);
      }

      // Loguj dane parafii (później można zapisać do osobnej tabeli parishes)
      if (metadata.accountType === "parish") {
        console.log("Parish registration data saved in auth metadata:", {
          parishName: metadata.parishName,
          address: metadata.address,
          nip: metadata.nip,
          contact: metadata.contact,
          documentUploaded: metadata.documentUploaded,
        });

        // TODO: Utwórz wpis w tabeli parishes jeśli istnieje
        /*
        await this.createParishRecord(userId, {
          name: metadata.parishName,
          address: metadata.address,
          nip: metadata.nip,
          contact_phone: metadata.contact,
          document_uploaded: metadata.documentUploaded || false,
          status: 'pending_verification',
        });
        */
      }
    } catch (error) {
      console.error("Exception creating extended user profile:", error);
      // Nie rzucaj błędu - podstawowe konto jest już utworzone
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("user_profiles")
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating last login:", error);
        // Nie rzucaj błędu - to nie jest krytyczne
      }
    } catch (error) {
      console.error("Error updating last login:", error);
      // Nie rzucaj błędu - to nie jest krytyczne
    }
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    return this.supabase.auth.getUser();
  }

  async getSession() {
    return this.supabase.auth.getSession();
  }

  async signInWithEmail(email: string) {
    // Magic link lub kod jednorazowy
    return this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  // Social login/SSO
  async socialLogin(provider: AuthProvider) {
    if (provider === "email") {
      throw new Error("Use signIn or signInWithEmail for email login.");
    }

    try {
      // Instagram i TikTok wymagają custom OAuth (patrz dokumentacja Supabase)
      return await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.warn(`${provider} provider not configured:`, error);
      throw new Error(`${provider} login is not configured yet`);
    }
  }

  async sessionAnalytics(event: string, data?: any) {
    return fetch("/api/session-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}

export const authService = new AuthService();
