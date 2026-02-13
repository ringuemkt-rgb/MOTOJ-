import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import { 
  Search, MapPin, Navigation, Clock, Star, Phone, MessageCircle, X, 
  ChevronRight, Sparkles, Zap, CreditCard, User, Menu, ArrowLeft, 
  Loader2, Bike, Send, Map as MapIcon, HelpCircle, Settings, LogOut,
  LocateFixed, Compass, Award, ShieldCheck, Bell, Wallet,
  Camera, Mic, Video, Image as ImageIcon, Wand2, BrainCircuit, Globe,
  Plus, CreditCard as CardIcon, Banknote, Landmark, Check
} from 'lucide-react';

// Leaflet types hack
declare var L: any;

const TOKENS = {
  colors: {
    gold: '#FFC107',
    bg: '#0B0B0E',
    s1: '#15151A',
    s2: '#1E1E26',
    stroke: '#2A2A33',
    success: '#2EE59D',
    danger: '#FF4D4D',
  },
  radius: { card: '20px', btn: '14px' }
};

const ICONS3D = {
  moto: "https://img.icons8.com/isometric/512/delivery-scooter.png",
  delivery: "https://img.icons8.com/isometric/512/package.png",
  pharmacy: "https://img.icons8.com/isometric/512/pharmacy-shop.png",
  pin: "https://img.icons8.com/isometric/512/marker.png"
};

// --- TYPES ---
interface PaymentMethod {
  id: string;
  type: 'card' | 'cash' | 'pix';
  label: string;
  icon: React.ReactNode;
  details?: string;
}

// --- AUDIO UTILS ---
const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const decode = (base64: string) => new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}

const App: React.FC = () => {
  const [step, setStep] = useState<'onboarding' | 'main'>('onboarding');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'chat' | 'voice' | 'create'>('chat');
  const [thinking, setThinking] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  // Payment State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'cash', label: 'Dinheiro', icon: <Banknote size={20} /> },
    { id: '2', type: 'pix', label: 'Pix', icon: <Zap size={20} />, details: 'Pagamento instantâneo' },
    { id: '3', type: 'card', label: 'Mastercard •••• 1234', icon: <CardIcon size={20} />, details: 'Débito' },
  ]);
  const [selectedPaymentId, setSelectedPaymentId] = useState('3');
  const selectedPayment = paymentMethods.find(p => p.id === selectedPaymentId);
  
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);

  // --- REAL-TIME GPS TRACKING ---
  useEffect(() => {
    if (step === 'main') {
      const mapContainer = document.createElement('div');
      mapContainer.id = 'map';
      document.body.prepend(mapContainer);

      mapRef.current = L.map('map', { zoomControl: false }).setView([0, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-6 h-6 bg-gold rounded-full border-4 border-white shadow-2xl animate-pulse"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const watcher = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 16);
            if (markerRef.current) {
              markerRef.current.setLatLng([latitude, longitude]);
            } else {
              markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapRef.current);
            }
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watcher);
        if (mapContainer.parentNode) mapContainer.remove();
      };
    }
  }, [step]);

  // --- AI LOGIC ---
  const handleAsk = async () => {
    if (!inputText.trim()) return;
    const userMsg = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    const prompt = inputText;
    setInputText('');
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = thinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const config: any = {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: coords ? { latitude: coords.lat, longitude: coords.lng } : undefined
          }
        }
      };
      
      if (thinking) config.thinkingConfig = { thinkingBudget: 32768 };

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const startVoice = async () => {
    if (isLiveActive) {
      sessionRef.current?.close();
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    const outputNode = audioCtxRef.current.createGain();
    outputNode.connect(audioCtxRef.current.destination);

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsLiveActive(true);
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const inputCtx = new AudioContext({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          });
        },
        onmessage: async (msg: LiveServerMessage) => {
          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64 && audioCtxRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
            const buffer = await decodeAudioData(decode(audioBase64), audioCtxRef.current);
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
          }
        },
        onclose: () => setIsLiveActive(false)
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const addPaymentMethod = () => {
    const newId = String(paymentMethods.length + 1);
    const newMethod: PaymentMethod = {
      id: newId,
      type: 'card',
      label: `Novo Cartão •••• ${Math.floor(Math.random() * 9000) + 1000}`,
      icon: <CardIcon size={20} />,
      details: 'Crédito'
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setSelectedPaymentId(newId);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
      
      {/* ONBOARDING */}
      {step === 'onboarding' && (
        <div className="absolute inset-0 z-[1000] bg-bg flex flex-col p-10 animate-in fade-in duration-700">
          <div className="mt-20 text-center">
            <h1 className="text-6xl font-black italic tracking-tighter text-gold">MOTOJÁ</h1>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.4em] mt-2">GPS Premium Tracking</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img src={ICONS3D.moto} className="w-64 h-64 object-contain animate-bounce" />
          </div>
          <button 
            onClick={() => setStep('main')}
            className="w-full h-16 bg-gold text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-all"
          >
            Acessar Mapa Ao Vivo
          </button>
        </div>
      )}

      {/* MAIN OVERLAYS */}
      {step === 'main' && (
        <>
          {/* TOP BAR */}
          <div className="absolute top-14 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
            <button onClick={() => setIsMenuOpen(true)} className="w-12 h-12 glass rounded-full flex items-center justify-center pointer-events-auto active:scale-90 transition-all">
              <Menu size={20} className="text-gold" />
            </button>
            <div className="flex-1 mx-4 h-12 glass rounded-full px-6 flex items-center gap-3 pointer-events-auto">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest truncate">GPS Ativo: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Localizando...'}</span>
            </div>
            <button 
              onClick={() => setIsAiOpen(true)}
              className="w-12 h-12 bg-gold text-black rounded-full flex items-center justify-center pointer-events-auto shadow-xl"
            >
              <Sparkles size={20} />
            </button>
          </div>

          {/* BOTTOM ACTIONS */}
          <div className="absolute bottom-12 left-6 right-6 z-10 space-y-4">
             <div className="flex justify-between gap-3">
                <QuickService icon={ICONS3D.moto} label="Viagem" active />
                <QuickService icon={ICONS3D.delivery} label="Entrega" />
                <QuickService icon={ICONS3D.pharmacy} label="Saúde" />
             </div>
             
             <div className="glass p-6 rounded-[24px]">
                <div className="flex items-center justify-between mb-6">
                   <div>
                      <h3 className="text-xl font-black italic">Bora lá?</h3>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">A confirmação é imediata</p>
                   </div>
                   <Navigation size={24} className="text-gold animate-pulse" />
                </div>

                {/* Selected Payment Preview */}
                <button 
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full h-12 bg-white/5 border border-stroke rounded-xl px-4 flex items-center justify-between mb-4 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gold">{selectedPayment?.icon}</span>
                    <span className="text-xs font-bold">{selectedPayment?.label}</span>
                  </div>
                  <ChevronRight size={16} className="opacity-40" />
                </button>

                <button className="w-full h-16 bg-gold text-black font-black uppercase rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                   Confirmar Chamada <Zap size={20} fill="currentColor" />
                </button>
             </div>
          </div>

          {/* PAYMENT MANAGEMENT MODAL */}
          {isPaymentOpen && (
            <div className="fixed inset-0 z-[150] bg-bg/95 backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-500">
               <div className="p-6 border-b border-stroke flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet size={24} className="text-gold" />
                    <div>
                      <h2 className="text-2xl font-black italic text-gold">Pagamentos</h2>
                      <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Gerencie seus métodos</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPaymentOpen(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center"><X size={20} /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Métodos de Pagamento</p>
                  {paymentMethods.map((method) => (
                    <button 
                      key={method.id}
                      onClick={() => {
                        setSelectedPaymentId(method.id);
                        setIsPaymentOpen(false);
                      }}
                      className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${selectedPaymentId === method.id ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(255,193,7,0.1)]' : 'border-stroke bg-white/5'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPaymentId === method.id ? 'bg-gold text-black' : 'bg-white/10 text-gold'}`}>
                          {method.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black italic">{method.label}</p>
                          {method.details && <p className="text-[10px] opacity-50 font-bold uppercase">{method.details}</p>}
                        </div>
                      </div>
                      {selectedPaymentId === method.id && <Check size={20} className="text-gold" />}
                    </button>
                  ))}

                  <button 
                    onClick={addPaymentMethod}
                    className="w-full p-4 rounded-2xl border border-dashed border-stroke bg-white/5 flex items-center gap-4 active:scale-95 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold">
                      <Plus size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black italic">Adicionar Cartão</p>
                      <p className="text-[10px] opacity-50 font-bold uppercase">Crédito ou Débito</p>
                    </div>
                  </button>

                  <div className="pt-6 space-y-4">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Carteiras Digitais</p>
                    <button className="w-full p-4 rounded-2xl border border-stroke bg-white/5 flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold">
                           <Landmark size={20} />
                         </div>
                         <div className="text-left">
                           <p className="text-sm font-black italic">Google Pay</p>
                           <p className="text-[10px] font-bold uppercase">Em breve</p>
                         </div>
                      </div>
                    </button>
                  </div>
               </div>
               
               <div className="p-6 border-t border-stroke">
                  <button onClick={() => setIsPaymentOpen(false)} className="w-full h-14 bg-gold text-black font-black uppercase tracking-widest rounded-xl">Concluído</button>
               </div>
            </div>
          )}

          {/* LUMINA AI MODAL */}
          {isAiOpen && (
            <div className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-500">
               <div className="p-6 border-b border-stroke flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black italic text-gold">LUMINA AI</h2>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Contexto GPS Integrado</p>
                  </div>
                  <button onClick={() => setIsAiOpen(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center"><X size={20} /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-gold text-black' : 'glass'}`}>
                          <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                          {m.sources && (
                            <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                               {m.sources.map((s: any, si: number) => (
                                 <a key={si} href={s.web?.uri || s.maps?.uri} className="text-[10px] text-gold underline" target="_blank" rel="noopener noreferrer">Fonte {si+1}</a>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-6 border-t border-stroke space-y-4">
                  <div className="flex gap-2">
                     <button onClick={() => setAiMode('chat')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase ${aiMode === 'chat' ? 'bg-gold text-black' : 'glass'}`}>Chat</button>
                     <button onClick={() => setAiMode('voice')} className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase ${aiMode === 'voice' ? 'bg-gold text-black' : 'glass'}`}>Voz</button>
                  </div>

                  {aiMode === 'voice' ? (
                    <div className="flex flex-col items-center gap-4 py-6">
                       <button 
                         onClick={startVoice}
                         className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isLiveActive ? 'bg-gold animate-pulse' : 'glass'}`}
                       >
                          <Mic size={40} className={isLiveActive ? 'text-black' : 'text-gold'} />
                       </button>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{isLiveActive ? 'Ouvindo...' : 'Toque para falar'}</p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                       <button onClick={() => setThinking(!thinking)} className={`w-14 h-14 rounded-2xl flex items-center justify-center ${thinking ? 'bg-gold text-black' : 'glass'}`}>
                          <BrainCircuit size={20} />
                       </button>
                       <div className="flex-1 glass h-14 rounded-2xl px-4 flex items-center gap-3">
                          <input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            placeholder="Para onde vamos agora?"
                            className="bg-transparent border-none outline-none flex-1 text-sm font-bold"
                          />
                          <button onClick={handleAsk} className="w-10 h-10 bg-gold text-black rounded-xl flex items-center justify-center"><Send size={18} /></button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* SIDE MENU */}
          {isMenuOpen && (
             <div className="fixed inset-0 z-[200] animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-[80%] bg-bg border-r border-stroke p-10 flex flex-col animate-in slide-in-from-left duration-500">
                   <div className="mt-8 flex items-center gap-4 mb-12">
                      <div className="w-16 h-16 bg-gold text-black font-black text-3xl flex items-center justify-center rounded-2xl rotate-3 shadow-2xl shadow-gold/20">M</div>
                      <div>
                         <h3 className="text-xl font-black italic">Rodrigo M.</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Membro Titanium</p>
                      </div>
                   </div>
                   <nav className="flex-1 space-y-2">
                      <button onClick={() => setIsMenuOpen(false)} className="w-full flex items-center gap-5 p-4 rounded-xl transition-all bg-s1 border border-stroke text-gold">
                         <Navigation size={22} />
                         <span className="text-lg font-bold italic">Viagens</span>
                      </button>
                      <button onClick={() => { setIsPaymentOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-5 p-4 rounded-xl transition-all text-sec hover:bg-white/5">
                         <Wallet size={22} />
                         <span className="text-lg font-bold italic">Pagamentos</span>
                      </button>
                      <button className="w-full flex items-center gap-5 p-4 rounded-xl transition-all text-sec hover:bg-white/5">
                         <Clock size={22} />
                         <span className="text-lg font-bold italic">Histórico</span>
                      </button>
                      <button className="w-full flex items-center gap-5 p-4 rounded-xl transition-all text-sec hover:bg-white/5">
                         <Award size={22} />
                         <span className="text-lg font-bold italic">Elite Club</span>
                      </button>
                      <div className="h-px bg-stroke my-6" />
                      <button className="w-full flex items-center gap-5 p-4 rounded-xl transition-all text-sec hover:bg-white/5">
                         <Settings size={22} />
                         <span className="text-lg font-bold italic">Configurações</span>
                      </button>
                   </nav>
                   <button onClick={() => setStep('onboarding')} className="mt-auto flex items-center gap-4 p-5 text-danger font-black uppercase tracking-widest border border-danger/20 rounded-xl active:scale-95 transition-all">
                      <LogOut size={20} /> Logout
                   </button>
                </div>
             </div>
          )}
        </>
      )}
    </div>
  );
};

const QuickService = ({ icon, label, active = false }: any) => (
  <div className={`flex-1 glass p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${active ? 'border-gold scale-105' : 'border-transparent opacity-60'}`}>
     <img src={icon} className="w-10 h-10 object-contain" />
     <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </div>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);