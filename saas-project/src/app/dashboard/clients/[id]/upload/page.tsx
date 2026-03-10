'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MOCK_CLIENTS } from '@/lib/mock-data';
import Link from 'next/link';
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Play,
} from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

function FileDropZone({
  label,
  accept,
  icon: Icon,
  color,
  file,
  onFile,
}: {
  label: string;
  accept: string;
  icon: React.ElementType;
  color: string;
  file: UploadedFile | null;
  onFile: (f: UploadedFile) => void;
}) {
  const [dragging, setDragging] = useState(false);

  const simulate = (name: string, size: number) => {
    onFile({ name, size, progress: 0, status: 'uploading' });
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20 + 10;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        onFile({ name, size, progress: 100, status: 'done' });
      } else {
        onFile({ name, size, progress: Math.round(p), status: 'uploading' });
      }
    }, 200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) simulate(f.name, f.size);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) simulate(f.name, f.size);
  };

  return (
    <div
      className={`upload-zone rounded-2xl p-6 transition-all ${dragging ? 'dragover' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{label}</h3>
      <p className="text-sm text-slate-400 mb-4">Drag & drop or click to browse</p>
      <p className="text-xs text-slate-300 mb-4">{accept}</p>

      {file ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {file.status === 'done' ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
            )}
            <span className="text-slate-700 truncate font-medium">{file.name}</span>
            <span className="text-slate-400 text-xs flex-shrink-0">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          {file.status === 'uploading' && (
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="progress-bar h-full" style={{ width: `${file.progress}%` }}></div>
            </div>
          )}
          {file.status === 'done' && (
            <p className="text-xs text-green-600 font-medium">✓ Upload complete</p>
          )}
        </div>
      ) : (
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all">
          <Upload className="w-4 h-4" /> Choose File
          <input type="file" accept={accept} className="hidden" onChange={handleChange} />
        </label>
      )}
    </div>
  );
}

export default function UploadPage() {
  const { id } = useParams<{ id: string }>();
  const client = MOCK_CLIENTS.find(c => c.id === id) ?? MOCK_CLIENTS[0];

  const [purchaseFile, setPurchaseFile] = useState<UploadedFile | null>(null);
  const [gstr2bFile, setGstr2bFile] = useState<UploadedFile | null>(null);
  const [reconRunning, setReconRunning] = useState(false);
  const [reconDone, setReconDone] = useState(false);

  const canRecon = purchaseFile?.status === 'done' && gstr2bFile?.status === 'done';

  const handleRecon = () => {
    setReconRunning(true);
    setTimeout(() => {
      setReconRunning(false);
      setReconDone(true);
    }, 3000);
  };

  return (
    <DashboardLayout title="Upload Files" subtitle={client.name}>
      <div className="max-w-3xl mx-auto">
        <Link href={`/dashboard/clients/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to client
        </Link>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Filing Period: October 2024</p>
            <p className="text-sm text-blue-700">
              Upload your Purchase Register (Excel) and GSTR-2B (JSON/Excel) for the same period to run reconciliation.
            </p>
          </div>
        </div>

        {/* Upload zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <FileDropZone
            label="Purchase Register"
            accept=".xlsx, .xls, .csv"
            icon={FileSpreadsheet}
            color="bg-green-50 text-green-600"
            file={purchaseFile}
            onFile={setPurchaseFile}
          />
          <FileDropZone
            label="GSTR-2B"
            accept=".json, .xlsx, .xls"
            icon={FileJson}
            color="bg-purple-50 text-purple-600"
            file={gstr2bFile}
            onFile={setGstr2bFile}
          />
        </div>

        {/* Upload status summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Upload Status</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Purchase Register', file: purchaseFile },
              { label: 'GSTR-2B', file: gstr2bFile },
            ].map(({ label, file }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{label}</span>
                <div className="flex items-center gap-2">
                  {!file && <span className="text-xs text-slate-300">Not uploaded</span>}
                  {file?.status === 'uploading' && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> {file.progress}%
                    </span>
                  )}
                  {file?.status === 'done' && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reconciliation button */}
        {!reconDone ? (
          <button
            onClick={handleRecon}
            disabled={!canRecon || reconRunning}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg shadow-blue-200"
          >
            {reconRunning ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Reconciling invoices...</>
            ) : (
              <><Play className="w-5 h-5" /> Start Reconciliation</>
            )}
          </button>
        ) : (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-green-900 mb-1">Reconciliation Complete!</h3>
              <p className="text-sm text-green-700">10 invoices processed — 5 matched, 5 need review.</p>
            </div>
            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href={`/dashboard/clients/${id}/reconciliation`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm">
                View Results
              </Link>
              <Link href={`/dashboard/clients/${id}/final-sheet`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all text-sm">
                <FileSpreadsheet className="w-4 h-4" /> Final Reconciliation Sheet
              </Link>
              <Link href={`/dashboard/clients/${id}/reports`}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm">
                Download Reports
              </Link>
            </div>
          </div>
        )}

        {!canRecon && !reconRunning && (
          <p className="text-center text-sm text-slate-400 mt-3">
            Upload both files to enable reconciliation
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
