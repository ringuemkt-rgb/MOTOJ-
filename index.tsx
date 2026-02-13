import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Clock, 
  Star, 
  Phone, 
  MessageCircle, 
  X, 
  ChevronRight, 
  Sparkles,
  Zap,
  CreditCard as CardIcon,
  User,
  Menu,
  ArrowLeft,
  Loader2,
  Bike,
  Send,
  Map as MapIcon,
  HelpCircle,
  Settings,
  LogOut,
  Plus,
  Minus,
  LocateFixed,
  Compass,
  Award,
  Circle,
  ShieldCheck,
  Bell,
  Wallet,
  Check,
  PlusCircle,
  Home,
  Briefcase
} from 'lucide-react';

// --- MotoJá Design System Manual 1.0 Constants ---
const MOTOJA_COLORS = {
  background: '#0B0B0E',
  surface1: '#15151A',
  surface2: '#1E1E26',
  stroke: '#2A2A33',
  primaryGold: '#FFC107',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3BD',
  textMuted: '#8A8A96',
  danger: '#FF4D4D',
  success: '#2EE59D',
};

// Isometric 3D Icons (Manual 4.2)
const ICONS3D = {
  moto: "https://img.icons8.com/isometric/512/luxury-vehicle.png", // Specialized 3D Luxury Moto
  standardMoto: "https://img.icons8.com/isometric/512/delivery-scooter.png",
  pin: "https://img.icons8.com/isometric/512/marker.png",
  shield: "https://img.icons8.com/isometric/512/shield.png",
  sparkle: "https://img.icons8.com/isometric/512/sparkling.png"
};

const PRESS_ANIM = "active:scale-[0.97] transition-all duration-150 ease-out";
const RADIUS_CARD = "rounded-2xl"; // 16px
const RADIUS_BUTTON = "rounded-xl"; // 12px
const RADIUS_DRAWER = "rounded-t-[24px]"; // 24px top

type AppStep = 'onboarding' | 'main';
type RideStatus = 'idle' | 'searching' | 'matched' | 'in_trip';
type ServiceType = 'moto' | 'delivery' | 'pharmacy';

const App: React.FC = () => {
  const [appStep, setAppStep] = useState<AppStep>('onboarding');
  const [status, setStatus] = useState<RideStatus>('idle');
  const [selectedService, setSelectedService] = useState<ServiceType>('moto');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Simulation State
  const [mapZoom, setMapZoom] = useState(1.5);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const visited = localStorage.getItem('motoja_manual_visited');
    if (visited) setAppStep('main');
  }, []);

  const handleStart = () => {
    localStorage.setItem('motoja_manual_visited', 'true');
    setAppStep('main');
  };

  const startBooking = () => {
    setStatus('searching');
    setTimeout(() => setStatus('matched'), 3500);
  };

  return (
    <div 
      className="h-screen w-full flex flex-col overflow-hidden select-none font-sans"
      style={{ backgroundColor: MOTOJA_COLORS.background, color: MOTOJA_COLORS.textPrimary }}
    >
      
      {/* 1. ONBOARDING (Manual 1.2/4.2) */}
      {appStep === 'onboarding' && (
        <div className="h-full w-full flex flex-col p-8 relative animate-in fade-in duration-1000">
           <div className="mt-16 text-center relative z-10">
              <h1 className="text-6xl font-black tracking-tighter italic mb-2" style={{ color: MOTOJA_COLORS.primaryGold }}>MOTOJÁ</h1>
              <p className="text-[10px] font-medium tracking-[0.4em] uppercase opacity-40">Elite Mobility Solution</p>
           </div>
           
           <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute w-72 h-72 rounded-full blur-[80px] opacity-10" style={{ backgroundColor: MOTOJA_COLORS.primaryGold }} />
              <img src={ICONS3D.moto} className="w-full max-w-xs transform rotate-12 drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)] animate-float" />
           </div>

           <div className="space-y-4 relative z-10">
              <div className={`p-6 border ${RADIUS_CARD}`} style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}>
                 <div className="flex items-center gap-3 mb-2">
                    <img src={ICONS3D.shield} className="w-8 h-8" />
                    <h2 className="text-lg font-bold">Experiência Premium</h2>
                 </div>
                 <p className="text-sm leading-relaxed" style={{ color: MOTOJA_COLORS.textSecondary }}>
                    Mobilidade urbana redesenhada com tecnologia de ponta, segurança máxima e pilotos certificados.
                 </p>
              </div>

              <button 
                onClick={handleStart}
                className={`w-full h-14 text-black font-bold text-base ${RADIUS_BUTTON} shadow-xl ${PRESS_ANIM} flex items-center justify-center gap-2 uppercase tracking-widest`}
                style={{ backgroundColor: MOTOJA_COLORS.primaryGold }}
              >
                Começar agora <ChevronRight size={20} />
              </button>
           </div>
        </div>
      )}

      {/* 2. MAIN APP (Manual 6.2) */}
      {appStep === 'main' && (
        <div className="flex-1 relative flex flex-col">
          
          {/* MAP LAYER */}
          <div 
            className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => { setIsDragging(true); dragRef.current = { x: e.clientX - mapPan.x, y: e.clientY - mapPan.y }; }}
            onMouseMove={(e) => { if(isDragging) setMapPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y }); }}
            onMouseUp={() => setIsDragging(false)}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
              style={{ transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom}) rotateX(30deg)` }}
            >
              <div className="absolute w-[400%] h-[400%] opacity-10 grid grid-cols-12 gap-8">
                 {[...Array(144)].map((_, i) => (
                   <div key={i} className="w-full h-32 border border-white/10 rounded-2xl" />
                 ))}
              </div>

              {/* USER MARKER (Manual 4.1) */}
              <div className="relative transform rotateX(-30deg)">
                 <div className="absolute inset-0 w-24 h-24 border border-white/20 rounded-full animate-ping -translate-x-1/2 -translate-y-1/2" />
                 <div className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MOTOJA_COLORS.primaryGold, boxShadow: `0 0 10px ${MOTOJA_COLORS.primaryGold}` }} />
                 </div>
              </div>

              {/* DRIVER SIM (Manual 4.2) */}
              <div className="absolute top-[10%] left-[30%] transform rotateX(-30deg) animate-pulse">
                 <img src={ICONS3D.moto} className="w-16 h-16 drop-shadow-xl" />
              </div>
            </div>

            {/* TOP BAR (Architecture Spec) */}
            <div className="absolute top-12 inset-x-4 z-20 flex items-center justify-between">
               <button 
                 onClick={() => setIsMenuOpen(true)}
                 className={`w-12 h-12 flex items-center justify-center rounded-full border ${PRESS_ANIM}`}
                 style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}
               >
                  <Menu size={20} style={{ color: MOTOJA_COLORS.primaryGold }} />
               </button>

               <div 
                 className="flex-1 mx-4 h-12 flex items-center justify-center gap-2 rounded-full border backdrop-blur-md"
                 style={{ backgroundColor: `${MOTOJA_COLORS.surface1}CC`, borderColor: MOTOJA_COLORS.stroke }}
               >
                  <span className="font-black text-sm uppercase italic tracking-tighter" style={{ color: MOTOJA_COLORS.primaryGold }}>MotoJá</span>
                  <div className="w-px h-4 bg-white/10" />
                  <MapPin size={12} style={{ color: MOTOJA_COLORS.primaryGold }} />
                  <span className="text-[10px] font-bold uppercase truncate max-w-[120px]" style={{ color: MOTOJA_COLORS.textSecondary }}>Av. Paulista, 1000</span>
               </div>

               <button 
                 onClick={() => setIsAssistantOpen(true)}
                 className={`w-12 h-12 flex items-center justify-center rounded-full border ${PRESS_ANIM}`}
                 style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}
               >
                  <img src={ICONS3D.sparkle} className="w-6 h-6" />
               </button>
            </div>
          </div>

          {/* BOTTOM PERSISTENT DRAWER (Manual 6.2) */}
          <div className="mt-auto relative z-30 px-4 pb-10 animate-in slide-in-from-bottom duration-700">
            
            {status === 'idle' && (
              <div className="space-y-4">
                {/* SEARCH CARD (Manual 5.3/5.4) */}
                <div 
                  className={`p-6 border shadow-2xl ${RADIUS_CARD}`}
                  style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}
                >
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: MOTOJA_COLORS.textMuted }}>Para onde vamos?</p>
                   
                   <div 
                     className={`flex items-center gap-3 p-4 border cursor-pointer ${RADIUS_CARD} transition-all active:scale-[0.98]`}
                     style={{ backgroundColor: MOTOJA_COLORS.surface2, borderColor: 'transparent' }}
                   >
                      <Search size={20} style={{ color: MOTOJA_COLORS.primaryGold }} />
                      <span className="text-base font-medium" style={{ color: MOTOJA_COLORS.textMuted }}>Buscar destino...</span>
                   </div>

                   {/* QUICK ACTIONS (Manual 6.1) */}
                   <div className="flex justify-between items-center mt-6">
                      <QuickAction icon={<Home size={18} />} label="Casa" />
                      <QuickAction icon={<Briefcase size={18} />} label="Trabalho" />
                      <QuickAction icon={<Star size={18} />} label="Favoritos" />
                      <QuickAction icon={<MapPin size={18} />} label="No Mapa" />
                   </div>
                </div>

                {/* SERVICE SELECTION (Manual 4.2) */}
                <div className={`p-4 border ${RADIUS_CARD} flex gap-4 overflow-x-auto no-scrollbar`} style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}>
                   <ServiceTab 
                     type="moto" 
                     icon={ICONS3D.moto} 
                     label="MotoJá" 
                     price="R$ 12,50" 
                     active={selectedService === 'moto'} 
                     onClick={() => setSelectedService('moto')} 
                   />
                   <ServiceTab 
                     type="delivery" 
                     icon="https://img.icons8.com/isometric/512/package.png" 
                     label="Entrega" 
                     price="R$ 8,00" 
                     active={selectedService === 'delivery'} 
                     onClick={() => setSelectedService('delivery')} 
                   />
                   <ServiceTab 
                     type="pharmacy" 
                     icon="https://img.icons8.com/isometric/512/pharmacy-shop.png" 
                     label="Saúde" 
                     price="Fixo" 
                     active={selectedService === 'pharmacy'} 
                     onClick={() => setSelectedService('pharmacy')} 
                   />
                </div>

                <button 
                  onClick={startBooking}
                  className={`w-full h-16 text-black font-bold text-lg ${RADIUS_BUTTON} shadow-xl ${PRESS_ANIM} uppercase tracking-widest flex items-center justify-center gap-2`}
                  style={{ backgroundColor: MOTOJA_COLORS.primaryGold }}
                >
                   Confirmar {selectedService.toUpperCase()} <Zap size={20} className="fill-black" />
                </button>
              </div>
            )}

            {/* SEARCHING VIEW (Manual 2.4/5.3) */}
            {status === 'searching' && (
              <div 
                className={`p-8 border text-center space-y-6 ${RADIUS_DRAWER}`}
                style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}
              >
                 <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-2 rounded-full animate-spin" style={{ borderColor: `${MOTOJA_COLORS.primaryGold}22`, borderTopColor: MOTOJA_COLORS.primaryGold }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <img src={ICONS3D.moto} className="w-20 animate-bounce-slow" />
                    </div>
                 </div>
                 <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">Localizando Piloto</h2>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Conexão Premium em andamento</p>
                 </div>
                 <button 
                   onClick={() => setStatus('idle')}
                   className={`w-full py-4 ${RADIUS_BUTTON} font-bold uppercase tracking-widest border transition-colors hover:bg-white/5`}
                   style={{ borderColor: MOTOJA_COLORS.danger, color: MOTOJA_COLORS.danger }}
                 >
                    Cancelar Solicitação
                 </button>
              </div>
            )}

            {/* MATCHED VIEW (Manual 5.3) */}
            {status === 'matched' && (
               <div 
                 className={`p-6 border space-y-5 ${RADIUS_DRAWER}`}
                 style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}
               >
                  <div className="flex items-center gap-4">
                     <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" className={`w-20 h-20 object-cover border-2 shadow-xl ${RADIUS_CARD}`} style={{ borderColor: MOTOJA_COLORS.stroke }} />
                     <div className="flex-1">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Seu Piloto</p>
                        <h3 className="text-2xl font-black italic">Ricardo Souza</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <Star size={12} fill={MOTOJA_COLORS.primaryGold} style={{ color: MOTOJA_COLORS.primaryGold }} />
                           <span className="text-xs font-bold">4.9 • 850 Viagens</span>
                        </div>
                     </div>
                  </div>

                  <div className={`p-4 flex items-center justify-between ${RADIUS_CARD}`} style={{ backgroundColor: MOTOJA_COLORS.surface2 }}>
                     <div className="flex items-center gap-4">
                        <img src={ICONS3D.moto} className="w-12" />
                        <div>
                           <p className="text-base font-black italic">Kawasaki Ninja</p>
                           <p className="text-[10px] font-bold opacity-40 tracking-widest">PXP-4290 • VERDE</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button className={`w-10 h-10 flex items-center justify-center border ${RADIUS_BUTTON} ${PRESS_ANIM}`} style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}><Phone size={18} /></button>
                        <button className={`w-10 h-10 flex items-center justify-center border ${RADIUS_BUTTON} ${PRESS_ANIM}`} style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}><MessageCircle size={18} /></button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <button className={`h-14 ${RADIUS_BUTTON} font-black uppercase text-xs tracking-widest border ${PRESS_ANIM}`} style={{ backgroundColor: MOTOJA_COLORS.surface1, borderColor: MOTOJA_COLORS.stroke }}>Chat</button>
                     <button onClick={() => setStatus('idle')} className={`h-14 ${RADIUS_BUTTON} font-black uppercase text-xs tracking-widest text-white ${PRESS_ANIM}`} style={{ backgroundColor: MOTOJA_COLORS.danger }}>Cancelar</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWER MENU (Manual 5.3) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)} />
           <div 
             className="absolute left-0 top-0 bottom-0 w-[75%] p-8 flex flex-col border-r shadow-2xl animate-in slide-in-from-left duration-500" 
             style={{ backgroundColor: MOTOJA_COLORS.background, borderColor: MOTOJA_COLORS.stroke }}
           >
              <div className="mt-8 mb-12 flex items-center gap-4">
                <div className={`w-16 h-16 flex items-center justify-center font-black text-3xl shadow-2xl rotate-2`} style={{ backgroundColor: MOTOJA_COLORS.primaryGold, color: MOTOJA_COLORS.background, borderRadius: '16px' }}>M</div>
                <div>
                  <h3 className="font-black text-xl italic leading-none">Carlos P.</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Nível Platinum</p>
                </div>
              </div>
              
              <nav className="flex-1 space-y-1">
                <MenuOption icon={<MapIcon size={22} />} label="Explorar" active onClick={() => setIsMenuOpen(false)} />
                <MenuOption icon={<Clock size={22} />} label="Atividade" onClick={() => setIsMenuOpen(false)} />
                <MenuOption icon={<Wallet size={22} />} label="Pagamento" onClick={() => setIsMenuOpen(false)} />
                <MenuOption icon={<Award size={22} />} label="Vantagens" onClick={() => setIsMenuOpen(false)} />
                <div className="h-px bg-white/5 my-4" />
                <MenuOption icon={<Settings size={22} />} label="Ajustes" onClick={() => setIsMenuOpen(false)} />
              </nav>

              <button 
                onClick={() => { setAppStep('onboarding'); setIsMenuOpen(false); }} 
                className={`w-full p-4 ${RADIUS_BUTTON} font-black text-danger flex items-center gap-4 mt-auto border border-danger/20 ${PRESS_ANIM}`}
                style={{ backgroundColor: `${MOTOJA_COLORS.danger}0A` }}
              >
                <LogOut size={20} /> LOGOUT
              </button>
           </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

const ServiceTab: React.FC<{ icon: string, label: string, price: string, active: boolean, onClick: () => void, type: string }> = ({ icon, label, price, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`min-w-[100px] flex-1 p-4 border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${RADIUS_CARD} ${active ? 'scale-105 shadow-lg' : 'opacity-40 hover:opacity-70'} ${PRESS_ANIM}`}
    style={{ 
      backgroundColor: active ? MOTOJA_COLORS.surface2 : 'transparent',
      borderColor: active ? MOTOJA_COLORS.primaryGold : MOTOJA_COLORS.stroke
    }}
  >
    <img src={icon} className="w-12 h-12 object-contain" />
    <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: active ? MOTOJA_COLORS.primaryGold : MOTOJA_COLORS.textSecondary }}>{label}</span>
    <span className="text-[10px] font-bold" style={{ color: MOTOJA_COLORS.success }}>{price}</span>
  </div>
);

const QuickAction: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <div className={`flex flex-col items-center gap-2 cursor-pointer group ${PRESS_ANIM}`}>
     <div 
       className={`w-14 h-14 flex items-center justify-center border transition-all group-hover:bg-white/5 ${RADIUS_BUTTON}`} 
       style={{ backgroundColor: MOTOJA_COLORS.surface2, borderColor: MOTOJA_COLORS.stroke }}
     >
        <div style={{ color: MOTOJA_COLORS.textSecondary }}>{icon}</div>
     </div>
     <span className="text-[10px] font-bold uppercase" style={{ color: MOTOJA_COLORS.textMuted }}>{label}</span>
  </div>
);

const MenuOption: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-6 py-4 transition-all group ${RADIUS_BUTTON} ${
      active ? 'shadow-xl' : 'hover:bg-white/5 text-white/50 hover:text-white'
    } ${PRESS_ANIM}`}
    style={{ backgroundColor: active ? MOTOJA_COLORS.surface2 : 'transparent' }}
  >
    <div className="transition-transform group-hover:scale-110" style={{ color: active ? MOTOJA_COLORS.primaryGold : MOTOJA_COLORS.textMuted }}>{icon}</div>
    <span className="text-lg font-black italic tracking-tight">{label}</span>
  </button>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);