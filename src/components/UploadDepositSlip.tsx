import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UploadDepositSlipProps {
  paymentId: string;
  onUploadComplete: () => void;
}

export default function UploadDepositSlip({ paymentId, onUploadComplete }: UploadDepositSlipProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      setError(null);

      const file = event.target.files?.[0];
      if (!file) return;

      const { error } = await supabase.storage
        .from('deposit-slips')
        .upload(`${paymentId}/${file.name}`, file);

      if (error) throw error;

      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={loading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Uploading...</p>}
    </div>
  );
} 