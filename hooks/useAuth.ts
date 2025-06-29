import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

interface RegisterMetadata {
  name: string;
  userType: 'user' | 'parish';
  parish?: {
    name: string;
    address: string;
    city: string;
  };
}

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas logowania");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: RegisterMetadata) => {
    try {
      setLoading(true);
      setError(null);

      // Rejestracja użytkownika
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            user_type: metadata.userType,
            ...metadata.parish && {
              parish_name: metadata.parish.name,
              parish_address: metadata.parish.address,
              parish_city: metadata.parish.city
            }
          }
        }
      });

      if (signUpError) throw signUpError;

      // Jeśli to rejestracja parafii, dodaj rekord w tabeli parishes
      if (metadata.userType === 'parish' && metadata.parish && authData.user) {
        const { error: parishError } = await supabase
          .from('parishes')
          .insert({
            name: metadata.parish.name,
            address: metadata.parish.address,
            city: metadata.parish.city,
            admin_id: authData.user.id,
            status: 'pending' // Parafia wymaga weryfikacji przez administratora
          });

        if (parishError) throw parishError;
      }

      return authData;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas rejestracji");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return { success: true, message: "Password reset email sent" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      return { success: true, message: "Password updated successfully" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    loading,
    error,
    user,
    isAuthenticated: !!user,
  };
};
