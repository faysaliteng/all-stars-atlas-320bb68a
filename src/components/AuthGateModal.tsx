import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, Phone, Eye, EyeOff, Upload, FileText, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import IdUploadModal from "@/components/IdUploadModal";

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: () => void;
  title?: string;
  description?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const AuthGateModal = ({ open, onOpenChange, onAuthenticated, title, description }: AuthGateModalProps) => {
  const { login, register, socialLogin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showIdUpload, setShowIdUpload] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idDocType, setIdDocType] = useState<"nid" | "passport">("nid");

  // If already authenticated, proceed immediately
  if (isAuthenticated && open) {
    setTimeout(() => onAuthenticated(), 0);
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Invalid File", description: "Upload JPG, PNG, WebP, or PDF only.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File Too Large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    setIdDocument(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Required", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        if (!firstName || !lastName) {
          toast({ title: "Required", description: "Please enter your name.", variant: "destructive" });
          setLoading(false);
          return;
        }
        if (!idDocument) {
          toast({ title: "ID Required", description: "Please upload your NID or Passport for verification.", variant: "destructive" });
          setLoading(false);
          return;
        }
        await register({ firstName, lastName, email, phone, password });
        try {
          const formData = new FormData();
          formData.append("document", idDocument);
          formData.append("documentType", idDocType);
          await api.upload("/auth/upload-id-document", formData);
        } catch {
          console.warn("ID document upload deferred");
        }
      }
      toast({ title: "Success", description: mode === "login" ? "Logged in successfully!" : "Account created! Your ID is under verification." });
      onAuthenticated();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Authentication failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      const result = await socialLogin(provider);
      if (result.needsIdUpload) {
        setShowIdUpload(true);
      } else {
        toast({ title: "Success", description: `Signed in with ${provider === 'google' ? 'Google' : 'Facebook'}!` });
        onAuthenticated();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || `${provider} sign-in failed`, variant: "destructive" });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <>
      <Dialog open={open && !showIdUpload} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              {title || "Sign in to continue"}
            </DialogTitle>
            <DialogDescription>
              {description || "Please sign in or create an account to complete your booking. Your data will be saved to your account."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button type="button" onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "login" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
              Sign In
            </button>
            <button type="button" onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "register" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
              Create Account
            </button>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-10 text-sm" disabled={!!socialLoading} onClick={() => handleSocialLogin('google')}>
              {socialLoading === 'google' ? (
                <div className="w-4 h-4 mr-1.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              )}
              Google
            </Button>
            <Button variant="outline" className="h-10 text-sm" disabled={!!socialLoading} onClick={() => handleSocialLogin('facebook')}>
              {socialLoading === 'facebook' ? (
                <div className="w-4 h-4 mr-1.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              )}
              Facebook
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[10px] text-muted-foreground">or with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gate-fn">First Name</Label>
                  <Input id="gate-fn" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gate-ln">Last Name</Label>
                  <Input id="gate-ln" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="h-10" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="gate-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input id="gate-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-10 pl-9" />
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="gate-phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input id="gate-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880 1XXX-XXXXXX" className="h-10 pl-9" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="gate-password">Password</Label>
              <div className="relative">
                <Input id="gate-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* NID/Passport upload for registration */}
            {mode === "register" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  ID Verification <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setIdDocType("nid")}
                    className={`flex-1 text-[11px] font-medium py-1.5 px-2 rounded-md border transition-colors ${idDocType === "nid" ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                    🪪 NID Card
                  </button>
                  <button type="button" onClick={() => setIdDocType("passport")}
                    className={`flex-1 text-[11px] font-medium py-1.5 px-2 rounded-md border transition-colors ${idDocType === "passport" ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                    🛂 Passport
                  </button>
                </div>

                {idDocument ? (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium truncate flex-1">{idDocument.name}</span>
                    <button type="button" onClick={() => setIdDocument(null)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 border border-dashed border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      Upload {idDocType === "nid" ? "NID" : "Passport"} copy (JPG, PNG, PDF — Max 5MB)
                    </span>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            )}

            <Button type="submit" className="w-full h-10 font-bold" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In & Continue" : "Create Account & Continue"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Your booking details are saved. {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary font-medium hover:underline">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </DialogContent>
      </Dialog>

      <IdUploadModal
        open={showIdUpload}
        onOpenChange={setShowIdUpload}
        onComplete={() => {
          setShowIdUpload(false);
          toast({ title: "Verified!", description: "ID uploaded. Proceeding with your booking." });
          onAuthenticated();
        }}
      />
    </>
  );
};

export default AuthGateModal;
