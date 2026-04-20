import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";

type Step = "email" | "code";

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: isAllowed, error: rpcError } = await supabase.rpc('is_email_allowed', { p_email: email });

    if (rpcError) {
      setLoading(false);
      setError("Der opstod en fejl. Prøv igen.");
      return;
    }

    if (!isAllowed) {
      setLoading(false);
      setError("Denne email har ikke adgang. Kontakt administrator.");
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
    } else {
      setStep("code");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });

    setLoading(false);

    if (verifyError) {
      setError("Koden er ugyldig eller udløbet. Tjek din email eller anmod om en ny kode.");
      return;
    }

    navigate("/", { replace: true });
  };

  const handleBack = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">RAASCHOU</CardTitle>
          <CardDescription>
            {step === "email" ? "Log ind med din email" : `Indtast koden sendt til ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="din@email.dk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" variant="blue" disabled={loading}>
                <Mail className="mr-2 h-4 w-4" />
                {loading ? "Sender..." : "Send login-kode"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <Button type="submit" className="w-full" variant="blue" disabled={loading || code.length !== 6}>
                <KeyRound className="mr-2 h-4 w-4" />
                {loading ? "Verificerer..." : "Log ind"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Skift email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
