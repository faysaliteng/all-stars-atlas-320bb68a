/**
 * Mandatory ID Upload Modal — shown after social signup when user has no ID document
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Upload, FileText, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface IdUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const IdUploadModal = ({ open, onOpenChange, onComplete }: IdUploadModalProps) => {
  const { toast } = useToast();
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idDocType, setIdDocType] = useState<"nid" | "passport">("nid");
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!idDocument) {
      toast({ title: "Required", description: "Please select your ID document to upload.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("document", idDocument);
      formData.append("documentType", idDocType);
      await api.upload("/auth/upload-id-document", formData);
      toast({ title: "ID Uploaded!", description: "Your identity document is now under verification." });
      onComplete();
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Identity Verification Required
          </DialogTitle>
          <DialogDescription>
            For security and regulatory compliance, all users must verify their identity with a National ID or Passport.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            This is a <strong>one-time requirement</strong>. Your document is securely stored and only used for account verification. You won't be able to make bookings until verified.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Document Type</Label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIdDocType("nid")}
              className={`flex-1 text-xs font-medium py-2.5 px-3 rounded-lg border transition-colors ${idDocType === "nid" ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"}`}>
              🪪 National ID (NID)
            </button>
            <button type="button" onClick={() => setIdDocType("passport")}
              className={`flex-1 text-xs font-medium py-2.5 px-3 rounded-lg border transition-colors ${idDocType === "passport" ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"}`}>
              🛂 Passport Copy
            </button>
          </div>

          {idDocument ? (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{idDocument.name}</p>
                <p className="text-[10px] text-muted-foreground">{(idDocument.size / 1024).toFixed(0)} KB • {idDocType === "nid" ? "National ID" : "Passport"}</p>
              </div>
              <button type="button" onClick={() => setIdDocument(null)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-lg p-5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <Upload className="w-7 h-7 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center">
                Upload {idDocType === "nid" ? "NID card" : "Passport"} (front side)<br />
                <span className="text-[10px]">JPG, PNG, WebP, or PDF — Max 5MB</span>
              </span>
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => {
            toast({ title: "Reminder", description: "You'll need to upload your ID before making any bookings." });
            onOpenChange(false);
          }}>
            Do It Later
          </Button>
          <Button className="flex-1 font-bold" onClick={handleUpload} disabled={!idDocument || uploading}>
            {uploading ? "Uploading..." : "Upload & Verify"}
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> Your ID is encrypted and securely stored. We comply with Bangladesh ICT regulations.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default IdUploadModal;
