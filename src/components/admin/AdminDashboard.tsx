import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Database, Brain, TrendingUp, Shield, CheckCircle2, Sparkles } from "lucide-react";

const AdminDashboard = () => {
  const [votes, setVotes] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#222D52] to-[#2a3a5a] flex items-center justify-center relative overflow-hidden">
        <style>
          {`
            @keyframes pulse-glow {
              0%, 100% { box-shadow: 0 0 20px rgba(210, 182, 138, 0.4); }
              50% { box-shadow: 0 0 40px rgba(210, 182, 138, 0.8); }
            }
            
            .loading-ring {
              animation: pulse-glow 2s ease-in-out infinite;
            }
          `}
        </style>
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D2B68A] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#EEE5D9] rounded-full blur-3xl"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-[#222D52]/30 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-[#D2B68A] border-t-transparent rounded-full animate-spin loading-ring"></div>
          </div>
          <p className="text-xl text-[#FDFFFF] font-semibold tracking-wide">Cargando Sistema Electoral</p>
          <p className="text-[#D2B68A] text-sm mt-2">Inicializando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#222D52] to-[#2a3a5a] relative overflow-hidden">
      <style>
        {`
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          
          @keyframes shimmer-gold {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .float-gentle {
            animation: float-gentle 8s ease-in-out infinite;
          }
          
          .shimmer-gold {
            background: linear-gradient(90deg, transparent, rgba(210, 182, 138, 0.3), transparent);
            background-size: 200% 100%;
            animation: shimmer-gold 3s linear infinite;
          }
          
          .fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }
          
          .card-elegant {
            background: linear-gradient(135deg, rgba(34, 45, 82, 0.7) 0%, rgba(238, 229, 217, 0.05) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(210, 182, 138, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(210, 182, 138, 0.1);
          }
          
          .card-elegant:hover {
            border-color: rgba(210, 182, 138, 0.4);
            box-shadow: 0 12px 40px rgba(210, 182, 138, 0.2), inset 0 1px 0 rgba(210, 182, 138, 0.2);
            transform: translateY(-2px);
          }
          
          .gradient-gold {
            background: linear-gradient(135deg, #D2B68A 0%, #C9A77C 100%);
          }
        `}
      </style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#D2B68A] opacity-10 rounded-full blur-3xl float-gentle"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#EEE5D9] opacity-10 rounded-full blur-3xl float-gentle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#222D52] opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="bg-gradient-to-r from-[#222D52] via-[#2a3a5a] to-[#222D52] border-b border-[#D2B68A]/20 shadow-2xl">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between fade-in-up">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <Shield className="w-9 h-9 text-[#222D52]" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl shimmer-gold"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-[#FDFFFF] mb-1 flex items-center gap-3">
                    Sistema Electoral Nacional
                    <Sparkles className="w-7 h-7 text-[#D2B68A]" />
                  </h1>
                  <p className="text-[#D2B68A] font-medium tracking-wide">
                    Plataforma Avanzada de Gestión y Análisis Electoral
                  </p>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center gap-4">
                <div className="card-elegant rounded-xl px-5 py-3 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-[#D2B68A] font-medium">Estado del Sistema</p>
                    <p className="text-sm text-[#FDFFFF] font-bold">Operativo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-elegant rounded-2xl p-6 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#D2B68A] to-[#C9A77C] rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-7 h-7 text-[#222D52]" />
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
                  <span className="text-xs font-bold text-emerald-400">+12%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[#FDFFFF] mb-1">1,247</h3>
              <p className="text-sm text-[#D2B68A] font-medium">Total de Votos</p>
            </div>

            <div className="card-elegant rounded-2xl p-6 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                  <span className="text-xs font-bold text-blue-400">Activo</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[#FDFFFF] mb-1">98.2%</h3>
              <p className="text-sm text-[#D2B68A] font-medium">Precisión de Datos</p>
            </div>

            <div className="card-elegant rounded-2xl p-6 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full">
                  <span className="text-xs font-bold text-purple-400">ML</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[#FDFFFF] mb-1">94.5%</h3>
              <p className="text-sm text-[#D2B68A] font-medium">Exactitud del Modelo</p>
            </div>

            <div className="card-elegant rounded-2xl p-6 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full">
                  <span className="text-xs font-bold text-amber-400">Live</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[#FDFFFF] mb-1">8</h3>
              <p className="text-sm text-[#D2B68A] font-medium">Candidatos Activos</p>
            </div>
          </div>

          <Tabs defaultValue="results" className="fade-in-up" style={{ animationDelay: '0.4s' }}>
            <TabsList className="w-full card-elegant border-[#D2B68A]/30 p-3 rounded-2xl shadow-2xl mb-8 grid grid-cols-4 gap-3 h-auto">
              <TabsTrigger 
                value="results" 
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#D2B68A] data-[state=active]:to-[#C9A77C] data-[state=active]:text-[#000000] data-[state=active]:shadow-xl text-[#FDFFFF]/90 transition-all duration-300 hover:bg-[#222D52]/50 hover:text-[#FDFFFF] font-medium text-sm whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Resultados</span>
              </TabsTrigger>
              <TabsTrigger 
                value="processing"
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#D2B68A] data-[state=active]:to-[#C9A77C] data-[state=active]:text-[#000000] data-[state=active]:shadow-xl text-[#FDFFFF]/90 transition-all duration-300 hover:bg-[#222D52]/50 hover:text-[#FDFFFF] font-medium text-sm whitespace-nowrap"
              >
                <Database className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Procesamiento</span>
              </TabsTrigger>
              <TabsTrigger 
                value="training"
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#D2B68A] data-[state=active]:to-[#C9A77C] data-[state=active]:text-[#000000] data-[state=active]:shadow-xl text-[#FDFFFF]/90 transition-all duration-300 hover:bg-[#222D52]/50 hover:text-[#FDFFFF] font-medium text-sm whitespace-nowrap"
              >
                <Brain className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Entrenamiento</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#D2B68A] data-[state=active]:to-[#C9A77C] data-[state=active]:text-[#000000] data-[state=active]:shadow-xl text-[#FDFFFF]/90 transition-all duration-300 hover:bg-[#222D52]/50 hover:text-[#FDFFFF] font-medium text-sm whitespace-nowrap"
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Análisis</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <div className="card-elegant rounded-2xl p-8 transition-all duration-300">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-[#FDFFFF] mb-2">Resultados Electorales</h2>
                  <p className="text-[#D2B68A]">Visualización en tiempo real de los resultados de votación</p>
                </div>
                <div className="h-96 flex items-center justify-center bg-[#222D52]/30 rounded-xl border-2 border-dashed border-[#D2B68A]/30">
                  <div className="text-center">
                    <BarChart3 className="w-20 h-20 text-[#D2B68A] mx-auto mb-4 opacity-50" />
                    <p className="text-[#FDFFFF] font-medium text-lg">Componente ResultsView</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="processing">
              <div className="card-elegant rounded-2xl p-8 transition-all duration-300">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-[#FDFFFF] mb-2">Procesamiento de Datos</h2>
                  <p className="text-[#D2B68A]">Gestión y transformación de datos electorales</p>
                </div>
                <div className="h-96 flex items-center justify-center bg-[#222D52]/30 rounded-xl border-2 border-dashed border-[#D2B68A]/30">
                  <div className="text-center">
                    <Database className="w-20 h-20 text-[#D2B68A] mx-auto mb-4 opacity-50" />
                    <p className="text-[#FDFFFF] font-medium text-lg">Componente DataProcessing</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="training">
              <div className="card-elegant rounded-2xl p-8 transition-all duration-300">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-[#FDFFFF] mb-2">Entrenamiento de Modelos</h2>
                  <p className="text-[#D2B68A]">Machine Learning para predicción y análisis electoral</p>
                </div>
                <div className="h-96 flex items-center justify-center bg-[#222D52]/30 rounded-xl border-2 border-dashed border-[#D2B68A]/30">
                  <div className="text-center">
                    <Brain className="w-20 h-20 text-[#D2B68A] mx-auto mb-4 opacity-50" />
                    <p className="text-[#FDFFFF] font-medium text-lg">Componente ModelTraining</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="card-elegant rounded-2xl p-8 transition-all duration-300">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-[#FDFFFF] mb-2">Análisis Avanzado</h2>
                  <p className="text-[#D2B68A]">Métricas y visualizaciones detalladas</p>
                </div>
                <div className="h-96 flex items-center justify-center bg-[#222D52]/30 rounded-xl border-2 border-dashed border-[#D2B68A]/30">
                  <div className="text-center">
                    <TrendingUp className="w-20 h-20 text-[#D2B68A] mx-auto mb-4 opacity-50" />
                    <p className="text-[#FDFFFF] font-medium text-lg">Componente Analytics</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 card-elegant rounded-xl p-5 border-[#D2B68A]/20 fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between text-sm">
              <p className="text-[#FDFFFF]/80">
                © 2025 Sistema Electoral Nacional. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-[#D2B68A]/70">Versión 2.0.1</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                  <span className="text-[#FDFFFF] font-semibold">En línea</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;