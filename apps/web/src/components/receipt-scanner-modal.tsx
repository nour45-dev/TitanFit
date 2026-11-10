'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, CheckCircle, RefreshCw, ZoomIn, Download, FileText, AlertCircle, Eye } from 'lucide-react';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptCaptured: (receiptDataUrl: string, fileName?: string) => void;
  isAr: boolean;
  title?: string;
}

export function ReceiptScannerModal({
  isOpen,
  onClose,
  onReceiptCaptured,
  isAr,
  title,
}: ReceiptScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'UPLOAD'>('CAMERA');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('receipt.jpg');
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start camera stream when modal is open and on CAMERA tab
  useEffect(() => {
    if (!isOpen || activeTab !== 'CAMERA' || capturedPreview) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, capturedPreview]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setCameraError(
        isAr
          ? 'تعذر الوصول المباشر لكاميرا الجهاز. يمكنك التقاط صورة فورية أو رفع ملف الإيصال أدناه.'
          : 'Could not access device camera directly. You can snap a photo or upload an image file below.',
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      stopCamera();
      setCapturedPreview(dataUrl);
      setFileName(`receipt-cam-${Date.now().toString().slice(-6)}.jpg`);
    } catch {
      // Fallback
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCapturedPreview(result);
      setIsProcessing(false);
      stopCamera();
    };
    reader.onerror = () => {
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!capturedPreview) return;
    onReceiptCaptured(capturedPreview, fileName);
    handleClose();
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    if (activeTab === 'CAMERA') {
      startCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPreview(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#121623]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {title || (isAr ? 'مسح أو إرفاق وصل التحويل / الإيصال' : 'Scan or Upload Transfer Receipt')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'التقط صورة فورية لوصل إنستاباي / فودافون كاش أو ارفع الصورة من جهازك'
                  : 'Capture or upload payment receipt (InstaPay, Vodafone Cash, Bank POS)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Toggle (Camera vs File Upload) */}
        {!capturedPreview && (
          <div className="grid grid-cols-2 gap-2 p-4 pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('CAMERA')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition ${
                activeTab === 'CAMERA'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300'
              }`}
            >
              <Camera className="h-4 w-4" />
              {isAr ? '📷 مسح مباشر بالكاميرا' : 'Live Camera Scan'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('UPLOAD')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition ${
                activeTab === 'UPLOAD'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300'
              }`}
            >
              <Upload className="h-4 w-4" />
              {isAr ? '📁 رفع صورة الوصل' : 'Upload File'}
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {capturedPreview ? (
            /* Scanned / Uploaded Receipt Preview */
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-500/60 bg-slate-950 p-2 text-center">
                <img
                  src={capturedPreview}
                  alt="Scanned Receipt"
                  className="max-h-72 w-full object-contain rounded-xl"
                />
                <span className="absolute bottom-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-black text-white shadow-md">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {isAr ? 'تم مسح الوصل بنجاح' : 'Receipt Captured'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fileName}</span>
                </div>
                <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                  {isAr ? 'جاهز للربط بالفاتورة' : 'Ready to Attach'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 py-3 text-xs font-black text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isAr ? 'إعادة المسح / الالتقاط' : 'Retake / Re-scan'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isAr ? 'تأكيد وإرفاق الوصل' : 'Confirm & Attach'}
                </button>
              </div>
            </div>
          ) : activeTab === 'CAMERA' ? (
            /* Live Camera Viewfinder */
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 ring-1 ring-slate-800">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />
                    {/* Viewfinder Target Frame */}
                    <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-amber-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                      {/* Scanning laser line animation */}
                      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#F59E0B] animate-pulse top-1/2" />
                    </div>
                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-black text-amber-300 backdrop-blur-sm">
                        {isAr ? 'وجّه الكاميرا نحو إيصال الدفع أو التحويل' : 'Align camera over transfer receipt'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-400">
                    <Camera className="h-10 w-10 text-amber-500/60 mb-2" />
                    <p className="text-xs font-bold text-slate-300">
                      {cameraError || (isAr ? 'جاري تهيئة الكاميرا...' : 'Initializing camera...')}
                    </p>
                    <label className="mt-4 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400">
                      <Camera className="h-4 w-4" />
                      <span>{isAr ? 'التقاط صورة بكاميرا الجهاز' : 'Snap Photo with Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {cameraActive && (
                <button
                  type="button"
                  onClick={captureFrame}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
                >
                  <Camera className="h-5 w-5" />
                  {isAr ? 'التقاط صورة الإيصال الآن' : 'Capture Receipt Photo Now'}
                </button>
              )}
            </div>
          ) : (
            /* File Upload Area */
            <div className="space-y-4">
              <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-amber-500 hover:bg-amber-50/50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/5">
                <Upload className="h-10 w-10 text-amber-500 mb-2" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {isAr ? 'اضغط لاختيار صورة الوصل أو اسحب الملف هنا' : 'Click to select receipt or drag & drop'}
                </span>
                <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  PNG, JPG, WEBP, PDF ({isAr ? 'حد أقصى 10 ميجابايت' : 'Max 10MB'})
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{isAr ? 'جاري معالجة صورة الإيصال...' : 'Processing receipt image...'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Receipt Full-View Inspector Modal
export function ReceiptViewerModal({
  isOpen,
  onClose,
  receiptUrl,
  fileName,
  invoiceNumber,
  isAr,
}: {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  fileName?: string;
  invoiceNumber?: string;
  isAr: boolean;
}) {
  if (!isOpen || !receiptUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/40 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#121623]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isAr ? 'معاينة وصل التحويل والدفع المرفق' : 'Attached Transfer Receipt Viewer'}
              </h3>
              {invoiceNumber && (
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {invoiceNumber}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={receiptUrl}
              download={fileName || 'receipt.jpg'}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              <span>{isAr ? 'تحميل' : 'Download'}</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-auto bg-slate-950 p-4 text-center">
          <img
            src={receiptUrl}
            alt="Payment Receipt"
            className="mx-auto max-h-[65vh] w-auto rounded-xl object-contain shadow-lg"
          />
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          <span>
            {isAr
              ? '🛡️ مستند مالي محفوظ ومشفر في سجل فواتير النادي لأغراض التدقيق المالي والضريبي'
              : '🛡️ Financial receipt archived securely for accounting and audit reconciliation'}
          </span>
        </div>
      </div>
    </div>
  );
}
