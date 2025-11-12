import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Vote, Check, Shield, Lock, BarChart3, Users, TrendingUp, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import departamentos from "@/data/Ubicacion/departamentos.json";
import provincias from "@/data/Ubicacion/provincias.json";
import distritos from "@/data/Ubicacion/distritos.json";
import { electoralApi } from '@/services/electoralApi';

// === UBICACIONES ===
const departamentosArray = Object.values(departamentos).flat();
const provinciasArray = Object.values(provincias).flat();
const distritosArray = Object.values(distritos).flat();

const UBICACIONES_PERU = departamentosArray.reduce((acc: any, dept: any) => {
  const provinciasDept = provinciasArray.filter((p: any) => p.id_padre_ubigeo === dept.id_ubigeo);
  acc[dept.nombre_ubigeo] = provinciasDept.reduce((provAcc: any, prov: any) => {
    const distritosProv = distritosArray.filter((d: any) => d.id_padre_ubigeo === prov.id_ubigeo);
    provAcc[prov.nombre_ubigeo] = distritosProv.map((d: any) => d.nombre_ubigeo);
    return provAcc;
  }, {});
  return acc;
}, {});

interface Candidate {
  id: number;
  name: string;
  party: string;
  proposals?: string;
}

export default function ElectoralForm() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [provincia, setProvincia] = useState("");
  const [distrito, setDistrito] = useState("");
  const [email, setEmail] = useState("");
  const [edad, setEdad] = useState("");
  const [genero, setGenero] = useState("");
  const [educacion, setEducacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // === CARGAR CANDIDATOS REALES ===
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const data = await electoralApi.getCandidates();
        const realCandidates: Candidate[] = data.candidates.map((c: any) => ({
          id: Number(c.id),
          name: c.name,
          party: c.party,
          proposals: c.proposals || "Propuestas no disponibles"
        }));
        setCandidates(realCandidates);
      } catch (err) {
        toast.error("Error al cargar candidatos");
        console.error(err);
      } finally {
        setLoadingCandidates(false);
      }
    };
    loadCandidates();
  }, []);

  const provinciasDisponibles = departamento ? Object.keys(UBICACIONES_PERU[departamento]) : [];
  const distritosDisponibles = departamento && provincia ? UBICACIONES_PERU[departamento][provincia] : [];

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCandidate || !nombre || !apellido || !dni || !celular || 
        !departamento || !provincia || !distrito || !email || 
        !edad || !genero || !educacion) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    if (!/^\d{8}$/.test(dni)) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (!/^\d{9}$/.test(celular.replace(/\s/g, ''))) {
      toast.error("El número de celular debe tener 9 dígitos");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Ingrese un correo electrónico válido");
      return;
    }

    const edadNum = parseInt(edad);
    if (edadNum < 18 || edadNum > 99) {
      toast.error("La edad debe estar entre 18 y 99 años");
      return;
    }

    setLoading(true);

    try {
      const hasVoted = await electoralApi.checkIfVoted(dni, email);
      if (hasVoted) {
        toast.error('Ya has emitido tu voto anteriormente con este DNI o Email');
        setLoading(false);
        return;
      }

      await electoralApi.submitVote({
        nombre,
        apellido,
        dni,
        email,
        celular,
        departamento,
        provincia,
        distrito,
        edad: parseInt(edad),
        genero,
        educacion,
        candidate_id: parseInt(selectedCandidate)
      });

      setSubmitted(true);
      toast.success('¡Tu voto ha sido registrado exitosamente!');
    } catch (error: any) {
      console.error('Error al votar:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail || 'Ya has votado anteriormente');
      } else {
        toast.error('Error al registrar el voto. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // === PANTALLA DE ÉXITO ===
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl animate-scale-in border-emerald-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-6 animate-scale-in shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl mb-2 text-emerald-900">¡Voto Registrado!</CardTitle>
            <CardDescription className="text-base text-emerald-700">
              Gracias {nombre} {apellido} por participar en el proceso electoral
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Su voto ha sido registrado de forma segura y será contabilizado en los resultados finales.
            </p>
            <div className="p-4 bg-emerald-100 rounded-lg border border-emerald-300">
              <div className="flex items-center justify-center gap-2 text-emerald-800">
                <Lock className="w-5 h-5" />
                <span className="font-semibold">Voto Encriptado y Seguro</span>
              </div>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // === FORMULARIO PRINCIPAL ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 animate-gradient-shift">
      <style>{`
        @keyframes gradient-shift { 
          0%, 100% { background-position: 0% 50%; } 
          50% { background-position: 100% 50%; } 
        }
        @keyframes float { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-20px); } 
        }
        @keyframes glow-pulse { 
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3); } 
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.5); } 
        }
        @keyframes scale-in { 
          from { transform: scale(0.95); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
        @keyframes fade-in-up { 
          from { transform: translateY(30px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
        .animate-gradient-shift { 
          background-size: 200% 200%; 
          animation: gradient-shift 15s ease infinite; 
        }
        .animate-float { 
          animation: float 6s ease-in-out infinite; 
        }
        .animate-glow-pulse { 
          animation: glow-pulse 2s ease-in-out infinite; 
        }
        .animate-scale-in { 
          animation: scale-in 0.5s ease-out; 
        }
        .animate-fade-in-up { 
          animation: fade-in-up 0.8s ease-out; 
        }
        .metallic-blue { 
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #60a5fa 50%, #3b82f6 75%, #1e3a8a 100%); 
          background-size: 200% 200%; 
        }
        .metallic-border { 
          border: 2px solid; 
          border-image: linear-gradient(135deg, #1e3a8a, #3b82f6, #60a5fa, #3b82f6, #1e3a8a) 1; 
        }
        .glass-effect { 
          background: rgba(255, 255, 255, 0.1); 
          backdrop-filter: blur(10px); 
          border: 1px solid rgba(255, 255, 255, 0.2); 
        }
      `}</style>

      {/* === HEADER === */}
      <header className="metallic-blue shadow-2xl sticky top-0 z-50 backdrop-blur-sm animate-glow-pulse">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-scale-in">
              <div className="w-12 h-12 glass-effect rounded-full flex items-center justify-center shadow-2xl animate-float">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  Sistema Electoral Digital
                </h1>
                <p className="text-blue-200 text-sm hidden md:block">Votación Segura y Transparente 2025</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin")} className="glass-effect text-white border-white/30 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-2xl animate-glow-pulse">
              <Shield className="w-4 h-4 mr-2" />
              Administración
            </Button>
          </div>
        </div>
      </header>

      {/* === HERO SECTION === */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in-up">
            <div className="inline-block mb-6 animate-float">
              <span className="px-6 py-3 glass-effect text-blue-100 rounded-full text-sm font-bold border-2 border-blue-400 shadow-2xl animate-glow-pulse">
                Proceso Electoral 2025
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white bg-clip-text  drop-shadow-2xl">
              Tu Voto Construye el Futuro
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-lg">
              Participa en el proceso electoral de manera <strong className="text-white">segura</strong>,
              <strong className="text-white"> transparente</strong> y <strong className="text-white">accesible</strong>.
              <br />Cada voto cuenta para construir la democracia que queremos.
            </p>
          </div>

          {/* === FEATURES GRID === */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <Card className="glass-effect shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 animate-scale-in hover:scale-110 border-2 border-blue-400 animate-glow-pulse group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 metallic-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-float group-hover:rotate-12 transition-transform duration-500">
                  <Lock className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white drop-shadow-md">Seguridad Garantizada</h3>
                <p className="text-sm text-blue-200">Encriptación de extremo a extremo</p>
              </CardContent>
            </Card>

            <Card className="glass-effect shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 animate-scale-in hover:scale-110 border-2 border-blue-400 animate-glow-pulse group" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 metallic-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-float group-hover:rotate-12 transition-transform duration-500">
                  <BarChart3 className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white drop-shadow-md">Resultados en Tiempo Real</h3>
                <p className="text-sm text-blue-200">Transparencia total del proceso</p>
              </CardContent>
            </Card>

            <Card className="glass-effect shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 animate-scale-in hover:scale-110 border-2 border-blue-400 animate-glow-pulse group" style={{ animationDelay: "0.4s" }}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 metallic-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-float group-hover:rotate-12 transition-transform duration-500">
                  <Users className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white drop-shadow-md">Acceso Universal</h3>
                <p className="text-sm text-blue-200">Sin barreras ni restricciones</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* === FORMULARIO === */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="max-w-5xl mx-auto shadow-2xl border-4 animate-scale-in metallic-border glass-effect animate-glow-pulse">
          <CardHeader className="metallic-blue border-b-4 border-blue-400">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-2xl animate-float">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-white drop-shadow-lg">Emitir Voto Electoral</CardTitle>
                <CardDescription className="text-base text-blue-100">
                  Complete el formulario para registrar su voto de forma segura y anónima
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 bg-gradient-to-br from-slate-800/95 to-blue-900/95">
            <form onSubmit={handleVote} className="space-y-8">

              {/* === INFORMACIÓN PERSONAL === */}
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full metallic-blue flex items-center justify-center text-white font-bold shadow-2xl animate-glow-pulse">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">Información Personal</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <Label htmlFor="nombre" className="text-base text-blue-100">Nombre *</Label>
                    <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej: Juan" className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white placeholder:text-blue-200 transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg" />
                  </div>
                  <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <Label htmlFor="apellido" className="text-base text-blue-100">Apellido *</Label>
                    <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required placeholder="Ej: Pérez" className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white placeholder:text-blue-200 transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg" />
                  </div>
                  <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                    <Label htmlFor="dni" className="text-base text-blue-100">DNI *</Label>
                    <Input id="dni" value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))} required placeholder="Ej: 12345678" maxLength={8} className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white placeholder:text-blue-200 transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg" />
                  </div>
                  <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                    <Label htmlFor="celular" className="text-base text-blue-100">Número de Celular *</Label>
                    <Input id="celular" value={celular} onChange={(e) => setCelular(e.target.value.replace(/\D/g, '').slice(0, 9))} required placeholder="Ej: 987654321" maxLength={9} className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white placeholder:text-blue-200 transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg" />
                  </div>
                </div>

                {/* === INFORMACIÓN DEMOGRÁFICA === */}
                <div className="border-t-2 border-blue-400 pt-8 mt-8"></div>

                <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full metallic-blue flex items-center justify-center text-white font-bold shadow-2xl animate-glow-pulse">
                      📊
                    </div>
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">Información Demográfica</h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {/* EDAD */}
                    <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                      <Label htmlFor="edad" className="text-base text-blue-100">Edad *</Label>
                      <Input
                        id="edad"
                        type="number"
                        value={edad}
                        onChange={(e) => setEdad(e.target.value)}
                        required
                        min="18"
                        max="99"
                        placeholder="Ej: 28"
                        className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white placeholder:text-blue-200 transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg"
                      />
                    </div>

                    {/* GÉNERO */}
                    <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                      <Label htmlFor="genero" className="text-base text-blue-100">Género *</Label>
                      <Select value={genero} onValueChange={setGenero} required>
                        <SelectTrigger className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg">
                          <SelectValue placeholder="Seleccione su género" className="text-blue-200" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-2 border-blue-400 bg-slate-800/95">
                          <SelectItem value="Masculino" className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            Masculino
                          </SelectItem>
                          <SelectItem value="Femenino" className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            Femenino
                          </SelectItem>
                          <SelectItem value="Otro" className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            Otro
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* EDUCACIÓN */}
                    <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
                      <Label htmlFor="educacion" className="text-base text-blue-100">Nivel Educativo *</Label>
                      <Select value={educacion} onValueChange={setEducacion} required>
                        <SelectTrigger className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg">
                          <SelectValue placeholder="Seleccione su nivel educativo" className="text-blue-200" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-2 border-blue-400 bg-slate-800/95">
                          <SelectItem value="Primaria" className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            Primaria Completa
                          </SelectItem>
                          <SelectItem value="Secundaria" className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            Secundaria Completa
                          </SelectItem>
                          <SelectItem value="Universidad" className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            Universidad (en curso o completa)
                          </SelectItem>
                          <SelectItem value="Posgrado" className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            Posgrado (Maestría/Doctorado)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* === UBICACIÓN === */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                    <Label htmlFor="departamento" className="text-base text-blue-100">Departamento *</Label>
                    <Select value={departamento} onValueChange={(value) => { setDepartamento(value); setProvincia(""); setDistrito(""); }}>
                      <SelectTrigger className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg">
                        <SelectValue placeholder="Seleccione su departamento" className="text-blue-200" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-2 border-blue-400 bg-slate-800/95">
                        {Object.keys(UBICACIONES_PERU).map((dept) => (
                          <SelectItem key={dept} value={dept} className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                    <Label htmlFor="provincia" className="text-base text-blue-100">Provincia *</Label>
                    <Select value={provincia} onValueChange={(value) => { setProvincia(value); setDistrito(""); }} disabled={!departamento}>
                      <SelectTrigger className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        <SelectValue placeholder={departamento ? "Seleccione su provincia" : "Primero seleccione un departamento"} className="text-blue-200" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-2 border-blue-400 bg-slate-800/95">
                        {provinciasDisponibles.map((prov) => (
                          <SelectItem key={prov} value={prov} className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            {prov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                    <Label htmlFor="distrito" className="text-base text-blue-100">Distrito *</Label>
                    <Select value={distrito} onValueChange={setDistrito} disabled={!provincia}>
                      <SelectTrigger className="h-12 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 text-white transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        <SelectValue placeholder={provincia ? "Seleccione su distrito" : "Primero seleccione una provincia"} className="text-blue-200" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-2 border-blue-400 bg-slate-800/95">
                        {distritosDisponibles.map((dist) => (
                          <SelectItem key={dist} value={dist} className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 cursor-pointer">
                            {dist}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-1">
                  <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                    <Label htmlFor="email" className="text-base text-blue-100">Correo Electrónico *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" className="h-13.5 glass-effect border-2 border-blue-400 focus:border-blue-300 focus:ring-blue-300 focus:bg-slate-700/50 text-white placeholder:text-blue-200 transition-all duration-300 hover:shadow-blue-500/50 hover:shadow-lg !text-xl px-4" style={{ fontSize: '20px' }} />
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-blue-400 pt-8"></div>

              {/* === SELECCIÓN DE CANDIDATO === */}
              <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full metallic-blue flex items-center justify-center text-white font-bold shadow-2xl animate-glow-pulse">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">Seleccione su Candidato</h3>
                </div>

                {loadingCandidates ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  </div>
                ) : (
                  <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                    <div className="grid gap-4">
                      {candidates.map((candidate, index) => (
                        <Card
                          key={candidate.id}
                          className={`transition-all duration-500 hover:shadow-2xl cursor-pointer border-2 animate-scale-in hover:scale-105 ${selectedCandidate === String(candidate.id)
                            ? "border-blue-400 shadow-blue-500/50 shadow-2xl glass-effect animate-glow-pulse"
                            : "glass-effect border-blue-500/50 hover:border-blue-400"
                            }`}
                          style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <RadioGroupItem value={String(candidate.id)} id={`c-${candidate.id}`} className="mt-1 w-6 h-6 border-blue-400 text-blue-400" />
                              <Label htmlFor={`c-${candidate.id}`} className="flex-1 cursor-pointer">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <div className="font-bold text-xl text-white drop-shadow-lg">{candidate.name}</div>
                                    {selectedCandidate === String(candidate.id) && (
                                      <Check className="w-5 h-5 text-blue-400 animate-scale-in" />
                                    )}
                                  </div>
                                  <div className="inline-block px-4 py-1 glass-effect text-blue-200 rounded-full text-sm font-medium border-2 border-blue-400 shadow-lg">
                                    {candidate.party}
                                  </div>
                                  <p className="text-sm text-blue-100 leading-relaxed pt-2">
                                    {candidate.proposals}
                                  </p>
                                </div>
                              </Label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </div>

              <div className="border-t-2 border-blue-400 pt-8"></div>

              {/* === BOTÓN DE ENVÍO === */}
              <Button
                type="submit"
                className="w-full metallic-blue shadow-2xl h-16 text-lg font-bold hover:scale-105 transition-all duration-500 animate-glow-pulse border-2 border-blue-300 hover:border-blue-200"
                size="lg"
                disabled={loading || loadingCandidates}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Procesando su voto...
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6 mr-2" />
                    Confirmar y Enviar Voto
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-blue-200 animate-fade-in-up" style={{ animationDelay: "1.5s" }}>
                Al confirmar, acepta que su voto será procesado de forma segura y anónima
              </p>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-gradient-to-t from-slate-900 to-transparent border-t-2 border-blue-500/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="animate-fade-in-up">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-white drop-shadow-lg">
                <Vote className="w-5 h-5 text-blue-400" />
                Sistema Electoral Digital
              </h4>
              <p className="text-sm text-blue-200">
                Plataforma segura y transparente para procesos democráticos.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h4 className="font-bold mb-3 text-white drop-shadow-lg">Garantías</h4>
              <ul className="text-sm text-blue-200 space-y-2">
                <li className="flex items-center gap-2 hover:text-white transition-colors">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Voto secreto y anónimo
                </li>
                <li className="flex items-center gap-2 hover:text-white transition-colors">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Encriptación de datos
                </li>
                <li className="flex items-center gap-2 hover:text-white transition-colors">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Auditoría transparente
                </li>
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <h4 className="font-bold mb-3 text-white drop-shadow-lg">Estadísticas</h4>
              <div className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4 text-blue-400 animate-float" />
                <span>Sistema en tiempo real</span>
              </div>
            </div>
          </div>
          <div className="text-center text-blue-200 border-t-2 border-blue-500/50 pt-8 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <p className="font-semibold drop-shadow-lg">© 2025 Sistema Electoral Digital</p>
            <p className="text-sm mt-2">Todos los derechos reservados • Proceso Electoral Seguro</p>
          </div>
        </div>
      </footer>
    </div>
  );
}