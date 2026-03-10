import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import type { ReconciledItem, SummaryStats } from '../App';

interface FileUploadAreaProps {
  onReconciliationComplete: (data: ReconciledItem[], summary: SummaryStats) => void;
}

export default function FileUploadArea({ onReconciliationComplete }: FileUploadAreaProps) {
  const [prFile, setPrFile] = useState<File | null>(null);
  const [gstrFile, setGstrFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const prInputRef = useRef<HTMLInputElement>(null);
  const gstrInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (!prFile || !gstrFile) {
        alert("Please upload both Purchase Register and GSTR-2B files.");
        return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('prFile', prFile);
    formData.append('gstr2bFile', gstrFile);

    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/reconcile`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to process. Make sure the files are valid Excel format.');
        }

        const result = await response.json();
        onReconciliationComplete(result.data, result.summary);
        
    } catch (error: any) {
        alert(error.message);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-8 transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-50">
        <UploadCloud size={100} className="text-primary-100" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Automated Reconciliation Engine</h2>
      <p className="text-slate-500 mb-6 max-w-lg">
        Upload your Tally Purchase Register and GST Portal GSTR-2B Excel files here. 
        Our engine will match them instantly using exact and fuzzy logic.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PR File Upload */}
          <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${prFile ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-primary-400'}`}>
            <input type="file" ref={prInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files && setPrFile(e.target.files[0])} />
            <div className="bg-primary-50 p-3 rounded-full text-primary-600 mb-3">
               {prFile ? <CheckCircle size={28} className="text-green-500" /> : <FileText size={28} />}
            </div>
            <h3 className="font-medium text-slate-700 text-center">{prFile ? prFile.name : 'Upload Purchase Register (PR)'}</h3>
            {!prFile && (
                <button onClick={() => prInputRef.current?.click()} className="mt-4 bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors">
                    Browse PR File
                </button>
            )}
          </div>

          {/* GSTR File Upload */}
          <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${gstrFile ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-amber-400'}`}>
            <input type="file" ref={gstrInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files && setGstrFile(e.target.files[0])} />
            <div className="bg-amber-50 p-3 rounded-full text-amber-600 mb-3">
               {gstrFile ? <CheckCircle size={28} className="text-green-500" /> : <FileText size={28} />}
            </div>
            <h3 className="font-medium text-slate-700 text-center">{gstrFile ? gstrFile.name : 'Upload GSTR-2B (Portal)'}</h3>
            {!gstrFile && (
                <button onClick={() => gstrInputRef.current?.click()} className="mt-4 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors">
                    Browse 2B File
                </button>
            )}
          </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        {prFile && gstrFile && (
           <button 
             onClick={handleProcess} 
             disabled={isUploading}
             className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
           >
             {isUploading ? <><Loader2 className="animate-spin" size={20} /> Processing Files...</> : 'Run Live Reconciliation ✨'}
           </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/50 border border-slate-100 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-medium text-sm">Smart Auto-mapping</h4>
            <p className="text-xs text-slate-500 mt-1">Our engine automatically maps standard Tally and GST format columns.</p>
          </div>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-medium text-sm text-amber-900">Data Requirements</h4>
            <p className="text-xs text-amber-700 mt-1">Ensure GSTIN, Vendor Name, Invoice Number, and Tax Amount columns exist.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
