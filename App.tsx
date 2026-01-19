
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppScreen, ProjectState, SizePreset, Position, ElementDetail, RaisedBedDetail, Material, ModelMode, GroundBase } from './types';
import { APP_PASSWORD, INITIAL_ELEMENT_DETAIL, INITIAL_RAISED_BED, SIZE_PRESETS, ELEMENT_LABELS, MATERIAL_OPTIONS, DEFAULT_ELEMENT_CONFIGS, GROUND_BASE_OPTIONS } from './constants';
import { generateGardenPreview } from './services/geminiService';

// --- Utility Functions ---

const compressImage = (dataUrl: string, maxDim = 1600): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Gagal menginisialisasi canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error("Gagal memuat gambar untuk dikompresi"));
    img.src = dataUrl;
  });
};

// --- Sub-Components ---

const LoadingOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "Menganalisis foto lahan...",
    "Menentukan pencahayaan optimal...",
    "Menyusun tata letak elemen...",
    "Merancang material bangunan...",
    "Merender detail tekstur vegetasi...",
    "Finalisasi visualisasi 3D..."
  ];

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setStep(s => (s + 1) % steps.length);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setStep(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#064e3b]/90 backdrop-blur-xl transition-all duration-500">
      <div className="relative w-full max-w-md p-8 text-center">
        <div className="mb-12 relative flex justify-center">
          <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full"></div>
          <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
             </svg>
          </div>
        </div>
        <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Ai Sedang Merancang</h3>
        <p className="text-emerald-200/80 font-medium h-6">{steps[step]}</p>
        <div className="mt-12 flex justify-center gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-emerald-400' : 'w-2 bg-emerald-800'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Login: React.FC<{ onLogin: (pass: string) => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#064e3b] p-6 relative overflow-hidden">
      <div className="bg-white p-10 rounded-2xl w-full max-w-md relative z-10 border border-emerald-100/20">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
             <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2.945M8 3.935A9 9 0 1116.065 20.065M8 3.935a8.963 8.963 0 018.065 0"></path></svg>
          </div>
        </div>
        <h1 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">
          SulapKebun <span className="block text-xs font-medium text-slate-400 mt-1">Developed by BuUtiq</span>
        </h1>
        <p className="text-slate-500 text-center mb-10 text-sm font-medium">Ubah Lahan Kosong Jadi Desain Impian</p>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(password); }} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 px-1">Kode Akses</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-center text-xl font-bold transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-2">
            Masuk Sekarang
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </button>
          <div className="flex items-center justify-center gap-4 pt-4">
             <div className="h-px bg-slate-100 flex-1"></div>
             <p className="text-[10px] text-slate-300 font-bold">Powered by Gemini Ai</p>
             <div className="h-px bg-slate-100 flex-1"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

const BeforeAfterSlider: React.FC<{ before: string, after: string }> = ({ before, after }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    }
  };
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video overflow-hidden rounded-2xl bg-slate-900 border-[12px] border-white cursor-col-resize select-none"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <img src={after} alt="Garden Design" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <img src={before} alt="Original Land" className="absolute inset-0 w-full h-full object-cover max-w-none" style={{ width: containerRef.current?.offsetWidth || '100%' }} />
      </div>
      <div className="absolute inset-y-0 w-1.5 bg-white pointer-events-none" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-emerald-500">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7l-5 5m0 0l5 5m-5-5h18m-5-10l5 5m0 0l-5 5"></path></svg>
        </div>
      </div>
      <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black pointer-events-none border border-white/20">Original</div>
      <div className="absolute top-6 right-6 bg-emerald-600/80 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black pointer-events-none border border-white/20">Desain Ai</div>
    </div>
  );
};

const PositionGrid: React.FC<{ value: Position, onChange: (pos: Position) => void }> = ({ value, onChange }) => {
  const gridPositions: Position[] = [
    'Kiri Atas', 'Tengah Atas', 'Kanan Atas',
    'Tengah Kiri', 'Tengah', 'Tengah Kanan',
    'Kiri Bawah', 'Tengah Bawah', 'Kanan Bawah'
  ];
  return (
    <div className="space-y-6 w-full max-w-[280px]">
      <div className="grid grid-cols-3 gap-3 w-full bg-slate-100 p-4 rounded-2xl border border-slate-200">
        {gridPositions.map(pos => (
          <button
            key={pos}
            onClick={() => onChange(pos)}
            className={`aspect-square rounded-xl border transition-all ${
              value === pos ? 'bg-emerald-600 border-emerald-700' : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
            title={pos}
          />
        ))}
      </div>
      <button 
        onClick={() => onChange('Otomatis')}
        className={`w-full py-4 rounded-2xl text-[10px] font-black border transition-all tracking-normal ${
          value === 'Otomatis' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
        }`}
      >
        Otomatis
      </button>
    </div>
  );
};

const FileUploader: React.FC<{
  label: string;
  onUpload: (dataUrl: string) => void;
  className?: string;
  preview?: string;
  note?: string;
  small?: boolean;
}> = ({ label, onUpload, className, preview, note, small }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const rawDataUrl = ev.target?.result as string;
          const compressedDataUrl = await compressImage(rawDataUrl);
          onUpload(compressedDataUrl);
        } catch (error) {
          console.error("Gagal memproses gambar:", error);
          alert("Gagal memproses gambar. Coba gunakan foto lain atau resolusi yang lebih kecil.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setIsProcessing(false);
        alert("Gagal membaca file.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={className}>
      <label className="block text-[10px] font-black text-slate-500 mb-3 px-1 tracking-normal">{label}</label>
      {!preview ? (
        <div className="relative group">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
            disabled={isProcessing}
          />
          <div className={`${small ? 'p-4' : 'p-12'} border-3 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center group-hover:border-emerald-500 transition-all bg-slate-50 group-hover:bg-emerald-50/50`}>
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <span className="text-[10px] font-black text-emerald-600 tracking-normal">Memproses...</span>
              </div>
            ) : (
              <>
                <div className={`${small ? 'w-10 h-10' : 'w-16 h-16'} bg-white rounded-2xl flex items-center justify-center mb-3 text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all`}>
                  <svg className={small ? 'w-6 h-6' : 'w-10 h-10'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                {!small && <span className="text-slate-600 font-black text-sm tracking-normal">Pilih Foto</span>}
                {note && <p className="text-[9px] text-slate-400 mt-2 text-center font-bold leading-relaxed tracking-normal">{note}</p>}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border-4 border-white aspect-video group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#064e3b]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
            <button onClick={() => onUpload('')} className="bg-red-500 text-white p-3 rounded-2xl hover:bg-red-600 transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
            <label className="bg-white text-emerald-600 p-3 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

const ElementConfigCard: React.FC<{
  title: string;
  detail: ElementDetail;
  onChange: (detail: ElementDetail) => void;
  onRemove?: () => void;
  isRaisedBed?: boolean;
}> = ({ title, detail, onChange, onRemove, isRaisedBed }) => {
  const handleSizePresetChange = (preset: SizePreset) => {
    if (preset !== 'Custom') {
      const { l, w } = SIZE_PRESETS[preset];
      onChange({ ...detail, sizePreset: preset, lengthM: l, widthM: w, areaM2: l * w });
    } else {
      onChange({ ...detail, sizePreset: preset });
    }
  };
  
  const isReadOnly = detail.sizePreset !== 'Custom';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-emerald-100/50 transition-all group space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-center relative z-10 border-b border-slate-50 pb-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"></path></svg>
           </div>
           <div>
             <h4 className="font-black text-xl text-slate-800 tracking-tight">{title}</h4>
             <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-normal">Konfigurasi Komponen</p>
           </div>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="bg-red-50 text-red-400 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-3 px-1 tracking-normal">Pilih Dimensi (Preset)</label>
            <div className="mb-6 relative">
              <select
                value={detail.sizePreset}
                onChange={(e) => handleSizePresetChange(e.target.value as SizePreset)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-[10px] font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none transition-all cursor-pointer tracking-normal"
              >
                <option value="Kecil">Kecil (1x1m)</option>
                <option value="Sedang">Sedang (2x1m)</option>
                <option value="Besar">Besar (3x1m)</option>
                <option value="Custom">Custom (Input Manual)</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border transition-all ${isReadOnly ? 'bg-slate-100 border-slate-200' : 'bg-white border-emerald-100'}`}>
                <label className="block text-[9px] font-black text-slate-400 mb-1 tracking-normal">Panjang Lahan (m)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  readOnly={isReadOnly}
                  value={detail.lengthM} 
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    onChange({ ...detail, lengthM: val, areaM2: val * detail.widthM });
                  }} 
                  className={`w-full bg-transparent font-black text-lg outline-none tracking-normal ${isReadOnly ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800'}`} 
                />
              </div>
              <div className={`p-4 rounded-2xl border transition-all ${isReadOnly ? 'bg-slate-100 border-slate-200' : 'bg-white border-emerald-100'}`}>
                <label className="block text-[9px] font-black text-slate-400 mb-1 tracking-normal">Lebar Lahan (m)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  readOnly={isReadOnly}
                  value={detail.widthM} 
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    onChange({ ...detail, widthM: val, areaM2: detail.lengthM * val });
                  }} 
                  className={`w-full bg-transparent font-black text-lg outline-none tracking-normal ${isReadOnly ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800'}`} 
                />
              </div>
            </div>
          </div>
          
          {isRaisedBed && (
            <div className="space-y-6">
               <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 px-1 tracking-normal">Material Utama</label>
                <div className="grid grid-cols-3 gap-2">
                  {MATERIAL_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => onChange({ ...detail, material: opt } as RaisedBedDetail)}
                      className={`py-3 px-1 rounded-xl text-[9px] font-black border transition-all tracking-normal ${
                        (detail as RaisedBedDetail).material === opt ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-4 cursor-pointer group bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input 
                  type="checkbox" 
                  checked={(detail as RaisedBedDetail).hasTrellis} 
                  onChange={(e) => onChange({ ...detail, hasTrellis: e.target.checked } as RaisedBedDetail)}
                  className="w-6 h-6 rounded-lg border-slate-200 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-700 tracking-normal">Tiang Rambatan / Ajir</span>
                  <span className="text-[9px] text-slate-400 font-bold tracking-normal">Optimasi Tanaman Vertikal</span>
                </div>
              </label>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 px-1 tracking-normal">Tanaman yang Ditanam</label>
                <textarea
                  value={(detail as RaisedBedDetail).plantsText}
                  onChange={(e) => onChange({ ...detail, plantsText: e.target.value } as RaisedBedDetail)}
                  placeholder="Misal: Tomat Ceri, Sawi, Bayam, Mint..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm h-28 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium transition-all tracking-normal"
                />
              </div>
            </div>
          )}
          <FileUploader
            label="Inspirasi Desain (Referensi)"
            preview={detail.refImageDataUrl}
            onUpload={(url) => onChange({ ...detail, refImageDataUrl: url })}
            small
            note="Ai akan mengadaptasi gaya visual foto ini."
          />
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-4 px-1 tracking-normal">Penempatan Lahan</label>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center">
               <PositionGrid value={detail.position} onChange={(pos) => onChange({ ...detail, position: pos })} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 italic mt-3 text-center tracking-normal">
              Posisi Terpilih: <span className="text-emerald-600 font-black tracking-normal">{detail.position}</span>
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-3 px-1 tracking-normal">Instruksi Kustom Ai</label>
            <textarea
              value={detail.notes}
              onChange={(e) => onChange({ ...detail, notes: e.target.value })}
              placeholder="Berikan detail tambahan agar Ai lebih akurat..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm h-32 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium transition-all tracking-normal"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end items-center gap-4 relative z-10">
        <div className="h-px bg-slate-100 flex-1"></div>
        <div className="bg-emerald-600 text-white text-[10px] font-black px-6 py-3 rounded-full flex items-center gap-2 tracking-normal">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          Area: {detail.areaM2.toFixed(2)} m²
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [isProcessing, setIsProcessing] = useState(false);

  const [project, setProject] = useState<ProjectState>({
    landPhotoDataUrl: '',
    landLengthM: 10,
    landWidthM: 6,
    groundBase: 'Rumput',
    removePeople: true,
    modelMode: 'flash',
    selectedElements: { 
      chickenCoop: false, 
      integratedFishPond: false, 
      organicProcessingUnit: false, 
      nurseryZone: false, 
      toolShed: false, 
      composter: false,
      maggotHouse: false,
      raisedBed: false 
    },
    elementsDetail: {},
    raisedBeds: []
  });

  useEffect(() => {
    const authStatus = localStorage.getItem('garden_planner_auth');
    if (authStatus === 'true') setScreen(AppScreen.APP);
    const savedProject = localStorage.getItem('garden_project_data');
    if (savedProject) {
      try { setProject(JSON.parse(savedProject)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => { localStorage.setItem('garden_project_data', JSON.stringify(project)); }, [project]);

  const landArea = useMemo(() => project.landLengthM * project.landWidthM, [project.landLengthM, project.landWidthM]);
  const totalElementsArea = useMemo(() => {
    let total = 0;
    Object.entries(project.selectedElements).forEach(([key, selected]) => {
      if (selected && key !== 'raisedBed') total += project.elementsDetail[key]?.areaM2 || 0;
    });
    project.raisedBeds.forEach(bed => total += bed.areaM2);
    return total;
  }, [project.selectedElements, project.elementsDetail, project.raisedBeds]);

  const isValid = useMemo(() => {
    const hasPhoto = !!project.landPhotoDataUrl;
    const hasDimensions = project.landLengthM > 0 && project.landWidthM > 0;
    const hasElements = Object.values(project.selectedElements).some(v => v) || project.raisedBeds.length > 0;
    const fits = totalElementsArea <= landArea;
    return hasPhoto && hasDimensions && hasElements && fits;
  }, [project.landPhotoDataUrl, project.landLengthM, project.landWidthM, project.selectedElements, project.raisedBeds, totalElementsArea, landArea]);

  const handleLogin = (pass: string) => {
    if (pass === APP_PASSWORD) {
      localStorage.setItem('garden_planner_auth', 'true');
      setScreen(AppScreen.APP);
    } else { alert("Sandi akses tidak valid!"); }
  };

  const handleModelModeChange = async (mode: ModelMode) => {
    if (mode === 'pro') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
    setProject(prev => ({ ...prev, modelMode: mode }));
  };

  const handleProcess = async () => {
    if (!isValid) return;

    setIsProcessing(true);
    try {
      const finalImage = await generateGardenPreview(project);
      setProject(prev => ({ ...prev, finalImage }));
      setScreen(AppScreen.RESULT);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) { 
      console.error(e);
      if (e.message?.includes("Requested entity was not found") || e.message?.includes("API_KEY_INVALID")) {
        alert("Terjadi masalah dengan API Key. Silakan pilih kembali API Key berbayar yang valid.");
        await window.aistudio.openSelectKey();
      } else {
        alert("Gagal memproses AI. Pastikan koneksi internet stabil."); 
      }
    } finally { setIsProcessing(false); }
  };

  const addRaisedBed = () => {
    setProject(p => ({
      ...p,
      raisedBeds: [...p.raisedBeds, { ...INITIAL_RAISED_BED }]
    }));
  };

  if (screen === AppScreen.LOGIN) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <LoadingOverlay isVisible={isProcessing} />
      
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[60] px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setScreen(AppScreen.APP)}>
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
              SulapKebun <span className="text-[10px] font-medium text-slate-400 align-middle ml-1 tracking-normal">Developed by BuUtiq</span>
            </h1>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5 tracking-normal">Beta Version</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <button onClick={() => { localStorage.removeItem('garden_planner_auth'); setScreen(AppScreen.LOGIN); }} className="text-slate-400 hover:text-red-500 text-xs font-black transition-all tracking-normal">Sign Out</button>
        </div>
      </nav>

      {screen === AppScreen.APP ? (
        <main className="max-w-6xl mx-auto p-6 space-y-16 pb-48 pt-12 transition-all duration-500">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black mb-4 tracking-normal">Ai-Driven Design System</div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">Visualkan Kebun Impian Anda</h2>
            <p className="text-slate-500 text-lg font-medium tracking-normal">Ubah lahan kosong menjadi ekosistem produktif terintegrasi dalam hitungan detik.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <section className="bg-white p-10 rounded-2xl border border-slate-100 relative overflow-hidden group">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl border border-emerald-100 tracking-normal">01</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Kondisi Lahan</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 tracking-normal">Unggah foto lahan saat ini</p>
                  </div>
                </div>
                <div className="mb-10">
                   <FileUploader label="Database Visual Lahan" preview={project.landPhotoDataUrl} onUpload={(url) => setProject(p => ({ ...p, landPhotoDataUrl: url }))} />
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer" onClick={() => setProject(p => ({ ...p, removePeople: !p.removePeople }))}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${project.removePeople ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">Otomatis Hilangkan Gambar Orang</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-normal">Lahan terlihat lebih bersih & fokus pada desain</p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${project.removePeople ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 transform ${project.removePeople ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </section>

              <section className="bg-white p-10 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl border border-emerald-100 tracking-normal">02</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Dimensi & Katalog</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 tracking-normal">Setup ukuran lahan dan pilih elemen kebun</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 px-1 tracking-normal">Panjang Lahan (m)</label>
                    <input type="number" step="0.5" className="w-full border border-slate-100 rounded-2xl px-8 py-6 bg-slate-50 outline-none text-2xl font-black text-slate-800 tracking-normal" value={project.landLengthM} onChange={(e) => setProject(p => ({ ...p, landLengthM: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 px-1 tracking-normal">Lebar Lahan (m)</label>
                    <input type="number" step="0.5" className="w-full border border-slate-100 rounded-2xl px-8 py-6 bg-slate-50 outline-none text-2xl font-black text-slate-800 tracking-normal" value={project.landWidthM} onChange={(e) => setProject(p => ({ ...p, landWidthM: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>

                <div className="mb-12">
                  <label className="block text-[10px] font-black text-slate-400 mb-4 px-1 tracking-normal">Tekstur Permukaan Lahan (Alas)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {GROUND_BASE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setProject(p => ({ ...p, groundBase: opt }))}
                        className={`py-4 rounded-xl text-[10px] font-black border transition-all tracking-normal ${
                          project.groundBase === opt ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400 mt-3 italic font-bold tracking-tight">* Alas ini akan mengisi area yang tidak tercover oleh elemen bangunan/bedengan.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                  {Object.keys(ELEMENT_LABELS).map(key => (
                    <button key={key} onClick={() => {
                      if (key === 'raisedBed') {
                        if (project.raisedBeds.length === 0) addRaisedBed();
                        setProject(p => ({ ...p, selectedElements: { ...p.selectedElements, raisedBed: !p.selectedElements.raisedBed } }));
                      } else {
                        const isCurrentlySelected = project.selectedElements[key as keyof typeof project.selectedElements];
                        const defaultConfig = DEFAULT_ELEMENT_CONFIGS[key] || INITIAL_ELEMENT_DETAIL;
                        
                        setProject(p => ({
                          ...p,
                          selectedElements: { ...p.selectedElements, [key]: !isCurrentlySelected },
                          elementsDetail: isCurrentlySelected ? p.elementsDetail : { ...p.elementsDetail, [key]: { ...defaultConfig } }
                        }));
                      }
                    }} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center h-28 ${project.selectedElements[key as keyof typeof project.selectedElements] || (key === 'raisedBed' && project.raisedBeds.length > 0) ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-emerald-200'}`}>
                      <span className="text-[10px] font-black leading-tight tracking-normal">{ELEMENT_LABELS[key]}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-12">
                   {Object.entries(project.selectedElements).map(([key, selected]) => {
                    if (selected && key !== 'raisedBed') return <ElementConfigCard key={key} title={ELEMENT_LABELS[key]} detail={project.elementsDetail[key]} onChange={(d) => setProject(p => ({ ...p, elementsDetail: { ...p.elementsDetail, [key]: d } }))} />;
                    return null;
                  })}
                  
                  {project.raisedBeds.length > 0 && (
                    <div className="space-y-8 pt-8 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Koleksi Raised Beds</h4>
                        <button onClick={addRaisedBed} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-emerald-700 transition-all flex items-center gap-2 tracking-normal">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                          Tambah Raised Bed
                        </button>
                      </div>
                      <div className="space-y-6">
                        {project.raisedBeds.map((bed, index) => (
                          <ElementConfigCard 
                            key={index} 
                            isRaisedBed 
                            title={`Raised Bed #${index + 1}`} 
                            detail={bed} 
                            onRemove={() => setProject(p => ({ ...p, raisedBeds: p.raisedBeds.filter((_, i) => i !== index) }))}
                            onChange={(d) => setProject(p => {
                              const newBeds = [...p.raisedBeds];
                              newBeds[index] = d as RaisedBedDetail;
                              return { ...p, raisedBeds: newBeds };
                            })} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
            
            <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
              <div className="bg-white p-10 rounded-2xl border border-slate-100">
                <h4 className="font-black text-slate-900 mb-8 text-[10px] border-b border-slate-50 pb-4 tracking-normal">Ai Engine Selection</h4>
                
                <div className="space-y-4 mb-10">
                  <button 
                    onClick={() => handleModelModeChange('flash')}
                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${project.modelMode === 'flash' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${project.modelMode === 'flash' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 tracking-normal">Flash Engine</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5 italic tracking-normal">Cepat & Standar Render</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleModelModeChange('pro')}
                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden ${project.modelMode === 'pro' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
                  >
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[7px] font-black px-3 py-1 rounded-bl-xl tracking-tighter">Premium</div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${project.modelMode === 'pro' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 tracking-normal">Ultra Pro Engine</p>
                      <p className="text-[9px] font-bold text-emerald-600 mt-0.5 italic tracking-normal">High-Res & Deep Details</p>
                    </div>
                  </button>

                  {project.modelMode === 'pro' && (
                    <div className="mt-4 p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="block text-[10px] font-black text-amber-800 tracking-normal">Api Key Billing</label>
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[8px] font-black text-emerald-600 underline tracking-tighter">Billing Guide</a>
                      </div>
                      <button 
                        onClick={() => window.aistudio.openSelectKey()}
                        className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-[10px] font-black text-amber-800 hover:bg-amber-100 transition-all flex items-center justify-center gap-2 tracking-normal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                        Ganti Api Key
                      </button>
                      <p className="text-[8px] font-bold text-amber-600 leading-relaxed tracking-tight">
                        * Mode Ultra Pro memerlukan Api Key berbayar dari Google Ai Studio. Pastikan billing aktif.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-10 border-t border-slate-50 pt-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 tracking-normal">Kapasitas Lahan</span>
                    <span className="text-xl font-black text-slate-900 tracking-normal">{landArea.toFixed(2)} m²</span>
                  </div>
                  <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                    <div className={`h-full transition-all duration-1000 rounded-full ${totalElementsArea > landArea ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (totalElementsArea / landArea) * 100)}%` }} />
                  </div>
                </div>

                <button disabled={!isValid || isProcessing} onClick={handleProcess} className={`w-full py-6 rounded-2xl font-black text-xs transition-all active:scale-[0.97] tracking-normal ${isValid && !isProcessing ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 text-slate-300'}`}>
                  {isProcessing ? 'Menganalisis Proyek...' : 'Generate Desain Ai'}
                </button>
              </div>
            </aside>
          </div>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto p-6 pb-32 pt-12">
          <section className="bg-white rounded-2xl overflow-hidden border border-slate-100">
             <div className="bg-[#064e3b] px-12 py-10 flex justify-between items-center text-white relative">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-400 mb-2 tracking-normal">Desain Berhasil Dibuat</p>
                <h2 className="text-3xl font-black tracking-tight">Hasil Visualisasi Kebun Terpadu</h2>
              </div>
              <div className="flex gap-4 relative z-10">
                <button onClick={() => {
                  if (project.finalImage) {
                    const link = document.createElement('a'); link.href = project.finalImage; link.download = 'SulapKebun_Render.png'; link.click();
                  }
                }} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black text-[10px] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 tracking-normal">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Simpan Gambar
                </button>
              </div>
            </div>
            
            <div className="p-12 bg-gradient-to-b from-white to-slate-50/50">
              <BeforeAfterSlider before={project.landPhotoDataUrl} after={project.finalImage || ''} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                 <div className="bg-white p-8 rounded-2xl border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 mb-4 tracking-normal">Efisiensi Ruang</h5>
                    <p className="text-3xl font-black text-emerald-600 tracking-normal">{((totalElementsArea/landArea)*100).toFixed(0)}% <span className="text-sm text-slate-400 tracking-normal">Terisi</span></p>
                 </div>
                 <div className="bg-white p-8 rounded-2xl border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 mb-4 tracking-normal">Total Komponen</h5>
                    <p className="text-3xl font-black text-emerald-600 tracking-normal">{Object.values(project.selectedElements).filter(v => v).length + project.raisedBeds.length - (project.selectedElements.raisedBed ? 1 : 0)} <span className="text-sm text-slate-400 tracking-normal">Elemen</span></p>
                 </div>
                 <div className="bg-white p-8 rounded-2xl border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 mb-4 tracking-normal">Status Proyek</h5>
                    <p className="text-xl font-black text-emerald-600 tracking-tight">Siap Realisasi</p>
                 </div>
              </div>

              <div className="mt-12 flex gap-6">
                 <button onClick={() => setScreen(AppScreen.APP)} className="flex-1 bg-slate-900 text-white py-6 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-3 tracking-normal">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Revisi Rencana
                 </button>
                 <button onClick={() => { if(confirm("Hapus semua data dan mulai dari awal?")) { localStorage.removeItem('garden_project_data'); window.location.reload(); } }} className="px-10 bg-white border-2 border-slate-100 text-slate-400 py-6 rounded-2xl font-black text-xs transition-all tracking-normal">
                    Reset Total
                 </button>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
