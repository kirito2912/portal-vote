import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, User, MapPin, FileText, Globe, Mail, Vote, Lock, AlertCircle, Shield, Calendar, MapPin as MapPinIcon, Award, Briefcase, School } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VoteModal from "@/components/VoteModal";
import distritos from "@/data/Ubicacion/distritos.json";
import departamentos from "@/data/Ubicacion/departamentos.json";
import provincias from "@/data/Ubicacion/provincias.json";
import { toast } from "sonner";

const distritosArray = Object.values(distritos).flat();
const departamentosArray = Object.values(departamentos).flat();
const provinciasArray = Object.values(provincias).flat();

interface Candidate {
  id: number;
  name: string;
  party: string;
  photo: string;
  bio: string;
  education: string;
  experience: string;
  proposals: string[];
  social: {
    website?: string;
    email?: string;
  };
  color: string;
}

export default function VotePage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedCandidateForVote, setSelectedCandidateForVote] = useState<number | null>(null);
  
  // Estados para el formulario de acceso
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [voterDni, setVoterDni] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voterApellidos, setVoterApellidos] = useState("");
  const [voterFechaNacimiento, setVoterFechaNacimiento] = useState("");
  const [voterRegion, setVoterRegion] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [voterDistrito, setVoterDistrito] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para calcular si es menor de edad
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Validar edad cuando cambia la fecha de nacimiento
  const handleFechaNacimientoChange = (fecha: string) => {
    setVoterFechaNacimiento(fecha);
    
    if (fecha) {
      const age = calculateAge(fecha);
      setIsMinor(age < 18);
    } else {
      setIsMinor(false);
    }
  };

  // Filtrar distritos según la región seleccionada
  const filteredDistritos = useMemo(() => {
    if (!selectedRegionId) return [];
    
    // Obtener todas las provincias del departamento seleccionado
    const provinciasDelDepartamento = provinciasArray.filter(
      (prov: any) => prov.id_padre_ubigeo === selectedRegionId
    );
    
    // Obtener los IDs de esas provincias
    const provinciaIds = provinciasDelDepartamento.map((prov: any) => prov.id_ubigeo);
    
    // Filtrar distritos que pertenezcan a esas provincias
    return distritosArray.filter((dist: any) => 
      provinciaIds.includes(dist.id_padre_ubigeo)
    );
  }, [selectedRegionId]);

  // Candidatos (idénticos al diseño original)
  const presidentialCandidates: Candidate[] = [
    {
      id: 1,
      name: "Keiko Fujimori",
      party: "Fuerza Popular",
      photo: "/placeholder.svg",
      bio: "Oficializó su candidatura presidencial por Fuerza Popular.",
      education: "Maestría en Administración Pública - Universidad de Harvard",
      experience: "Líder de Fuerza Popular, excongresista, candidata presidencial en elecciones anteriores",
      proposals: [
        "Fortalecimiento de la seguridad ciudadana",
        "Programas sociales focalizados",
        "Promoción de la inversión privada",
        "Mejora del sistema de salud pública",
        "Fomento a la educación técnica"
      ],
      social: {
        website: "https://fuerzapopular.com",
        email: "contacto@fuerzapopular.com",
      },
      color: "hsl(220 85% 45%)",
    },
    {
      id: 2,
      name: "Rafael López Aliaga",
      party: "Renovación Popular",
      photo: "/placeholder.svg",
      bio: "Renunció a su cargo como alcalde de Lima para postular a la presidencia.",
      education: "Maestría en Administración de Empresas",
      experience: "Ex alcalde de Lima, empresario, líder de Renovación Popular",
      proposals: [
        "Combate frontal a la corrupción",
        "Modernización del Estado",
        "Promoción de valores familiares",
        "Incentivos a la inversión extranjera",
        "Fortalecimiento de la seguridad nacional"
      ],
      social: {
        website: "https://lopezaliaga.com",
        email: "info@lopezaliaga.com",
      },
      color: "hsl(200 95% 45%)",
    },
    {
      id: 3,
      name: "César Acuña",
      party: "Alianza Para el Progreso",
      photo: "/placeholder.svg",
      bio: "Exgobernador regional, fundó Alianza Para el Progreso.",
      education: "Doctorado en Educación - Universidad Nacional de Trujillo",
      experience: "Ex gobernador regional de La Libertad, fundador de universidades privadas",
      proposals: [
        "Masificación de la educación técnica",
        "Impulso a la infraestructura educativa",
        "Programas de emprendimiento juvenil",
        "Desarrollo de infraestructura regional",
        "Apoyo a la pequeña empresa"
      ],
      social: {
        website: "https://cesaracuna.com",
        email: "contacto@cesaracuna.com",
      },
      color: "hsl(140 75% 45%)",
    },
    {
      id: 4,
      name: "George Forsyth",
      party: "Somos Perú",
      photo: "/placeholder.svg",
      bio: "Exalcalde y exarquero; candidato por Somos Perú.",
      education: "Estudios en Administración",
      experience: "Ex alcalde de La Victoria, ex futbolista profesional",
      proposals: [
        "Fortalecimiento del deporte nacional",
        "Mejora de la gestión municipal",
        "Programas de seguridad ciudadana",
        "Desarrollo de infraestructura deportiva",
        "Apoyo al talento juvenil"
      ],
      social: {
        website: "https://georgeforsyth.com",
        email: "info@georgeforsyth.com",
      },
      color: "hsl(30 85% 55%)",
    },
    {
      id: 5,
      name: "Yonhy Lescano",
      party: "Acción Popular",
      photo: "/placeholder.svg",
      bio: "Excongresista, se postula como candidato.",
      education: "Abogado - Universidad Nacional Mayor de San Marcos",
      experience: "Ex congresista de la República, miembro de Acción Popular",
      proposals: [
        "Defensa de la constitución",
        "Fortalecimiento del sistema judicial",
        "Programas de apoyo a la tercera edad",
        "Protección de los derechos humanos",
        "Transparencia en la gestión pública"
      ],
      social: {
        website: "https://yonhylescano.com",
        email: "contacto@yonhylescano.com",
      },
      color: "hsl(0 75% 55%)",
    },
    {
      id: 6,
      name: "Mariano González",
      party: "Salvemos al Perú",
      photo: "/placeholder.svg",
      bio: "Presidente de Salvemos al Perú; ha adelantado propuestas y se proyecta como aspirante.",
      education: "Economista - Universidad del Pacífico",
      experience: "Ex ministro de Economía, analista político",
      proposals: [
        "Reforma económica integral",
        "Transparencia en la gestión pública",
        "Fomento a las exportaciones",
        "Reducción de la burocracia estatal",
        "Incentivos a la innovación tecnológica"
      ],
      social: {
        website: "https://marianogonzalez.com",
        email: "info@marianogonzalez.com",
      },
      color: "hsl(280 75% 55%)",
    },
    {
      id: 7,
      name: "Roberto Chiabra",
      party: "PPC y Unidad y Paz",
      photo: "/placeholder.svg",
      bio: "Congresista y ex comandante general del Ejército; candidato por la coalición entre Partido Popular Cristiano (PPC) y Unidad y Paz.",
      education: "Estudios Militares - Escuela Militar de Chorrillos",
      experience: "Ex comandante general del Ejército, congresista de la República",
      proposals: [
        "Fortalecimiento de las FF.AA.",
        "Seguridad nacional integral",
        "Lucha contra el terrorismo",
        "Modernización de las fuerzas armadas",
        "Defensa de la soberanía nacional"
      ],
      social: {
        website: "https://robertochiabra.com",
        email: "contacto@robertochiabra.com",
      },
      color: "hsl(160 75% 45%)",
    }
  ];

  const regionalCandidates: Candidate[] = [
    {
      id: 8,
      name: "Rosa Vásquez Cuadrado",
      party: "Unidad Cívica Lima",
      photo: "/placeholder.svg",
      bio: "Gobernadora regional actual de Lima, buscando la reelección.",
      education: "Maestría en Gestión Pública - Universidad Nacional Mayor de San Marcos",
      experience: "Gobernadora Regional de Lima (2023-actualidad), ex alcaldesa distrital",
      proposals: [
        "Fortalecimiento de la infraestructura vial regional",
        "Programas de desarrollo agrícola en provincias",
        "Modernización de los servicios de salud regionales",
        "Impulso al turismo interno en la región",
        "Mejora de la conectividad digital rural"
      ],
      social: {
        email: "rosa.vasquez@regionlima.gob.pe",
      },
      color: "hsl(220 85% 45%)",
    },
    {
      id: 9,
      name: "Rohel Sánchez Sánchez",
      party: "Yo Arequipa",
      photo: "/placeholder.svg",
      bio: "Gobernador regional actual de Arequipa, candidato a la reelección.",
      education: "Ingeniero Civil - Universidad Nacional de San Agustín",
      experience: "Gobernador Regional de Arequipa (2023-actualidad), ex gerente municipal",
      proposals: [
        "Continuidad de proyectos de infraestructura vial",
        "Fomento a la industria y exportación regional",
        "Fortalecimiento del sector agroindustrial",
        "Modernización del sistema de salud arequipeño",
        "Promoción del turismo en el Valle del Colca"
      ],
      social: {
        email: "rohel.sanchez@regionarequipa.gob.pe",
      },
      color: "hsl(200 95% 45%)",
    },
    {
      id: 10,
      name: "Joana Cabrera Pimentel",
      party: "Alianza para el Progreso",
      photo: "/placeholder.svg",
      bio: "Gobernadora regional actual de La Libertad, busca la reelección.",
      education: "Economista - Universidad Nacional de Trujillo",
      experience: "Gobernadora Regional de La Libertad (2023-actualidad), ex viceministra",
      proposals: [
        "Expansión de proyectos de irrigación",
        "Fomento a la agroexportación regional",
        "Mejora de la seguridad ciudadana",
        "Desarrollo de infraestructura educativa",
        "Impulso al turismo arqueológico"
      ],
      social: {
        email: "joana.cabrera@regionlalibertad.gob.pe",
      },
      color: "hsl(140 75% 45%)",
    },
    {
      id: 11,
      name: "Werner Salcedo Álvarez",
      party: "Somos Perú",
      photo: "/placeholder.svg",
      bio: "Gobernador regional actual del Cusco, candidato a la reelección.",
      education: "Antropólogo - Universidad Nacional San Antonio Abad del Cusco",
      experience: "Gobernador Regional del Cusco (2023-actualidad), ex director de cultura",
      proposals: [
        "Protección y promoción del patrimonio cultural",
        "Desarrollo del turismo sostenible",
        "Mejora de la conectividad vial interprovincial",
        "Fortalecimiento de la agricultura andina",
        "Programas de desarrollo social en comunidades"
      ],
      social: {
        email: "werner.salcedo@regioncusco.gob.pe",
      },
      color: "hsl(30 85% 55%)",
    },
    {
      id: 12,
      name: "Zósimo Cárdenas Muje",
      party: "Sierra y Selva Contigo Junín",
      photo: "/placeholder.svg",
      bio: "Gobernador regional actual de Junín, busca la reelección.",
      education: "Ingeniero Agrónomo - Universidad Nacional del Centro del Perú",
      experience: "Gobernador Regional de Junín (2023-actualidad), ex director agrario",
      proposals: [
        "Desarrollo de la agricultura de la sierra y selva",
        "Mejora de la infraestructura productiva",
        "Fomento al turismo ecológico",
        "Fortalecimiento de la educación técnica",
        "Programas de desarrollo ganadero"
      ],
      social: {
        email: "zosimo.cardenas@regionjunin.gob.pe",
      },
      color: "hsl(0 75% 55%)",
    },
    {
      id: 13,
      name: "Luis Hidalgo Okimura",
      party: "Movimiento Regional Loreto",
      photo: "/placeholder.svg",
      bio: "Candidato a gobernador regional de Loreto con experiencia en gestión pública.",
      education: "Abogado - Universidad Nacional de la Amazonía Peruana",
      experience: "Ex alcalde provincial de Maynas, especialista en desarrollo amazónico",
      proposals: [
        "Protección de la biodiversidad amazónica",
        "Desarrollo de la conectividad fluvial",
        "Fomento al turismo ecológico",
        "Mejora de los servicios de salud",
        "Impulso a la investigación científica"
      ],
      social: {
        email: "luis.hidalgo@loreto.gob.pe",
      },
      color: "hsl(280 75% 55%)",
    },
    {
      id: 14,
      name: "Ana María Tello",
      party: "Fuerza Lambayeque",
      photo: "/placeholder.svg",
      bio: "Candidata a gobernadora regional de Lambayeque, ex congresista.",
      education: "Médica Cirujana - Universidad Nacional Pedro Ruiz Gallo",
      experience: "Ex congresista de la República, ex directora regional de salud",
      proposals: [
        "Fortalecimiento del sistema de salud regional",
        "Desarrollo del turismo arqueológico",
        "Apoyo a la pequeña y mediana empresa",
        "Mejora de la infraestructura educativa",
        "Programas de seguridad alimentaria"
      ],
      social: {
        email: "ana.tello@regionlambayeque.gob.pe",
      },
      color: "hsl(160 75% 45%)",
    },
    {
      id: 15,
      name: "Ricardo Chavarría",
      party: "Unidad Regional Piura",
      photo: "/placeholder.svg",
      bio: "Candidato a gobernador regional de Piura, ex alcalde provincial.",
      education: "Ingeniero Industrial - Universidad Nacional de Piura",
      experience: "Ex alcalde provincial de Piura, empresario agroindustrial",
      proposals: [
        "Desarrollo de infraestructura contra fenómenos naturales",
        "Fomento a la agroexportación",
        "Mejora de la conectividad vial",
        "Programas de reactivación económica",
        "Fortalecimiento de la educación técnica"
      ],
      social: {
        email: "ricardo.chavarria@regionpiura.gob.pe",
      },
      color: "hsl(320 75% 55%)",
    }
  ];

  const distritalCandidates: Candidate[] = [
    {
      id: 16,
      name: "Miguel Castro",
      party: "Acción Popular",
      photo: "/placeholder.svg",
      bio: "Candidato a la alcaldía del distrito de Miraflores, Lima.",
      education: "Arquitecto - Universidad Nacional de Ingeniería",
      experience: "Ex regidor distrital, especialista en desarrollo urbano",
      proposals: [
        "Mejora de espacios públicos y áreas verdes",
        "Programas de seguridad ciudadana",
        "Fomento al comercio local",
        "Modernización del transporte distrital",
        "Promoción cultural y turística"
      ],
      social: {
        email: "miguel.castro@miraflores.gob.pe",
      },
      color: "hsl(220 85% 45%)",
    },
    {
      id: 17,
      name: "Carmen Mendoza",
      party: "Somos Perú",
      photo: "/placeholder.svg",
      bio: "Candidata a la alcaldía del distrito de Arequipa, Arequipa.",
      education: "Educadora - Universidad Nacional de San Agustín",
      experience: "Ex directora regional de educación, líder comunal",
      proposals: [
        "Mejora de la infraestructura educativa",
        "Programas de apoyo a la tercera edad",
        "Fomento al deporte distrital",
        "Recuperación de áreas históricas",
        "Promoción del turismo local"
      ],
      social: {
        email: "carmen.mendoza@muniarequipa.gob.pe",
      },
      color: "hsl(200 95% 45%)",
    },
    {
      id: 18,
      name: "Carlos Rojas",
      party: "Alianza para el Progreso",
      photo: "/placeholder.svg",
      bio: "Candidato a la alcaldía del distrito de Trujillo, La Libertad.",
      education: "Ingeniero Civil - Universidad Nacional de Trujillo",
      experience: "Ex gerente municipal, especialista en obras públicas",
      proposals: [
        "Modernización del sistema de recojo de basura",
        "Mejora de la iluminación pública",
        "Programas de empleo juvenil",
        "Recuperación de espacios históricos",
        "Fomento a la cultura y arte local"
      ],
      social: {
        email: "carlos.rojas@munitrujillo.gob.pe",
      },
      color: "hsl(140 75% 45%)",
    },
    {
      id: 19,
      name: "Lucía Quispe",
      party: "Fuerza Cusco",
      photo: "/placeholder.svg",
      bio: "Candidata a la alcaldía del distrito de Wanchaq, Cusco.",
      education: "Antropóloga - Universidad Nacional San Antonio Abad del Cusco",
      experience: "Ex regidora distrital, defensora del patrimonio cultural",
      proposals: [
        "Protección del patrimonio cultural distrital",
        "Programas de desarrollo social",
        "Mejora de mercados municipales",
        "Fomento al turismo local",
        "Desarrollo de infraestructura deportiva"
      ],
      social: {
        email: "lucia.quispe@muniwanchaq.gob.pe",
      },
      color: "hsl(30 85% 55%)",
    },
    {
      id: 20,
      name: "Jorge Silva",
      party: "Junín Unido",
      photo: "/placeholder.svg",
      bio: "Candidato a la alcaldía del distrito de Huancayo, Junín.",
      education: "Economista - Universidad Nacional del Centro del Perú",
      experience: "Ex gerente municipal, especialista en desarrollo económico",
      proposals: [
        "Reactiviación económica post pandemia",
        "Mejora de la seguridad ciudadana",
        "Programas de apoyo a comerciantes",
        "Modernización del transporte público",
        "Fomento a la cultura y tradiciones"
      ],
      social: {
        email: "jorge.silva@munihuancayo.gob.pe",
      },
      color: "hsl(0 75% 55%)",
    }
  ];

  // Abrir modal de detalle
  const handleViewMore = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setModalOpen(true);
  };

  // Abrir modal de votación
  const handleVoteClick = (candidateId: number) => {
    setSelectedCandidateForVote(candidateId);
    setVoteModalOpen(true);
  };

  // Envío del formulario de acceso
  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validaciones
    if (!voterDni || !voterName || !voterApellidos || !voterFechaNacimiento || !voterRegion || !voterDistrito) {
      toast.error("Por favor complete todos los campos requeridos");
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{8}$/.test(voterDni)) {
      toast.error("El DNI debe tener exactamente 8 dígitos");
      setIsSubmitting(false);
      return;
    }

    // Validar edad
    const age = calculateAge(voterFechaNacimiento);
    if (age < 18) {
      setIsMinor(true);
      toast.error("Debe ser mayor de 18 años para ejercer el derecho al voto");
      setIsSubmitting(false);
      return;
    }

    // Simular verificación (en producción aquí iría la API)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setIsMinor(false);
    setIsAuthenticated(true);
    toast.success("Identidad verificada exitosamente. Ahora puede proceder a votar.");
    setIsSubmitting(false);
  };

  // Vista de verificación previa
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Lado Izquierdo - Branding */}
          <div className="text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto lg:mx-0">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Sistema Electoral
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  Nacional
                </span>
              </h1>
              <p className="text-xl text-blue-200 max-w-md mx-auto lg:mx-0">
                Plataforma segura y verificada para ejercer su derecho al voto
              </p>
            </div>

            <div className="hidden lg:block space-y-4">
              <div className="flex items-center gap-3 text-blue-200">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <span>Verificación de identidad segura</span>
              </div>
              <div className="flex items-center gap-3 text-blue-200">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Lock className="h-4 w-4 text-blue-400" />
                </div>
                <span>Encriptación de extremo a extremo</span>
              </div>
              <div className="flex items-center gap-3 text-blue-200">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
                <span>Protección de datos personales</span>
              </div>
            </div>
          </div>

          {/* Lado Derecho - Formulario */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Verificación de Identidad</CardTitle>
                <CardDescription className="text-blue-200 mt-2">
                  Ingrese sus datos oficiales para acceder al sistema
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleAccessSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DNI */}
                  <div className="space-y-3">
                    <Label htmlFor="dni" className="text-white font-medium">
                      Número de DNI *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dni"
                        value={voterDni}
                        onChange={(e) => setVoterDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="12345678"
                        maxLength={8}
                        required
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Nombres */}
                  <div className="space-y-3">
                    <Label htmlFor="nombre" className="text-white font-medium">
                      Nombres *
                    </Label>
                    <Input
                      id="nombre"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      placeholder="Ej: Juan Carlos"
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                    />
                  </div>

                  {/* Apellidos */}
                  <div className="space-y-3">
                    <Label htmlFor="apellidos" className="text-white font-medium">
                      Apellidos Completos *
                    </Label>
                    <Input
                      id="apellidos"
                      value={voterApellidos}
                      onChange={(e) => setVoterApellidos(e.target.value)}
                      placeholder="Ej: Pérez García"
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                    />
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div className="space-y-3">
                    <Label htmlFor="fechaNacimiento" className="text-white font-medium">
                      Fecha de Nacimiento *
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fechaNacimiento"
                        type="date"
                        value={voterFechaNacimiento}
                        onChange={(e) => handleFechaNacimientoChange(e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                      />
                    </div>
                    {isMinor && (
                      <div className="flex items-center gap-2 text-amber-300 text-sm bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                        <AlertCircle className="h-4 w-4" />
                        <span>Debe ser mayor de 18 años para votar</span>
                      </div>
                    )}
                  </div>

                  {/* Región */}
                  <div className="space-y-3">
                    <Label htmlFor="region" className="text-white font-medium">
                      Región *
                    </Label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                      <Select 
                        value={voterRegion} 
                        onValueChange={(value) => {
                          const selectedDep = departamentosArray.find((dep: any) => dep.nombre_ubigeo === value);
                          setVoterRegion(value);
                          setSelectedRegionId(selectedDep?.id_ubigeo || "");
                          setVoterDistrito("");
                        }}
                      >
                        <SelectTrigger className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-400">
                          <SelectValue placeholder="Seleccione su región" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20 text-white">
                          {departamentosArray.map((dep: any) => (
                            <SelectItem 
                              key={dep.id_ubigeo} 
                              value={dep.nombre_ubigeo}
                              className="focus:bg-blue-500"
                            >
                              {dep.nombre_ubigeo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Distrito */}
                  <div className="space-y-3">
                    <Label htmlFor="distrito" className="text-white font-medium">
                      Distrito de Residencia *
                    </Label>
                    <Select 
                      value={voterDistrito} 
                      onValueChange={setVoterDistrito}
                      disabled={!voterRegion}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-400">
                        <SelectValue placeholder={voterRegion ? "Seleccione su distrito" : "Primero seleccione región"} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-white/20 text-white">
                        {filteredDistritos.map((dist: any) => (
                          <SelectItem 
                            key={dist.id_ubigeo} 
                            value={dist.nombre_ubigeo}
                            className="focus:bg-blue-500"
                          >
                            {dist.nombre_ubigeo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botón enviar */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isMinor}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Verificando Identidad...
                    </>
                  ) : isMinor ? (
                    "Acceso Restringido - Menor de Edad"
                  ) : (
                    "Verificar Identidad y Acceder"
                  )}
                </Button>
              </form>

              {/* Pie */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-blue-300 text-sm">
                  🔒 Sus datos están protegidos 
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderCandidates = (candidates: Candidate[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {candidates.map((candidate) => (
        <Card 
          key={candidate.id} 
          className="group border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden"
          style={{ 
            borderLeftWidth: '6px', 
            borderLeftColor: candidate.color,
            borderTop: '1px solid hsl(var(--border))'
          }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-700 transition-all duration-300 group-hover:ring-primary/20">
                  <AvatarImage src={candidate.photo} alt={candidate.name} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                  style={{ backgroundColor: candidate.color }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <CardTitle className="text-xl leading-tight font-bold text-gray-900 dark:text-white">
                  {candidate.name}
                </CardTitle>
                <Badge 
                  style={{ backgroundColor: candidate.color }} 
                  className="text-white font-semibold px-3 py-1 text-xs"
                >
                  {candidate.party}
                </Badge>
                <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-2">
                  {candidate.bio}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Propuestas principales */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: candidate.color }} />
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Propuestas principales
                </h4>
              </div>
              <ul className="space-y-2">
                {candidate.proposals.slice(0, 2).map((proposal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold"
                      style={{ backgroundColor: candidate.color }}
                    >
                      {idx + 1}
                    </div>
                    <span className="leading-relaxed">{proposal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => handleViewMore(candidate)}
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
                variant="outline"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver más
              </Button>
              <Button 
                onClick={() => handleVoteClick(candidate.id)} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                size="sm"
              >
                <Vote className="h-4 w-4 mr-2" />
                Votar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-900 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-4">
            <Users className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
              Candidatos
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Conozca las propuestas y trayectoria de cada candidato para tomar una decisión informada
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="presidential" className="w-full">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-gray-100/80 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <TabsTrigger 
                value="presidential" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-blue-500/30 rounded-xl transition-all duration-200 font-semibold"
              >
                <Award className="h-4 w-4 mr-2" />
                Presidencial
              </TabsTrigger>
              <TabsTrigger 
                value="regional" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-blue-500/30 rounded-xl transition-all duration-200 font-semibold"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Regional
              </TabsTrigger>
              <TabsTrigger 
                value="distrital" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-blue-500/30 rounded-xl transition-all duration-200 font-semibold"
              >
                <School className="h-4 w-4 mr-2" />
                Distrital
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="presidential" className="mt-8">
            {renderCandidates(presidentialCandidates)}
          </TabsContent>

          <TabsContent value="regional" className="mt-8">
            {renderCandidates(regionalCandidates)}
          </TabsContent>

          <TabsContent value="distrital" className="mt-8">
            {renderCandidates(distritalCandidates)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de detalle */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
          {selectedCandidate && (
            <>
              <DialogHeader className="space-y-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-28 w-28 ring-4 ring-offset-4 ring-gray-100 dark:ring-gray-800">
                      <AvatarImage src={selectedCandidate.photo} alt={selectedCandidate.name} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                        {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-3 border-white dark:border-gray-800 shadow-lg"
                      style={{ backgroundColor: selectedCandidate.color }}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                        {selectedCandidate.name}
                      </DialogTitle>
                      <Badge 
                        style={{ backgroundColor: selectedCandidate.color }} 
                        className="text-white font-bold px-4 py-2 text-base"
                      >
                        {selectedCandidate.party}
                      </Badge>
                    </div>
                    <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedCandidate.bio}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8 py-6">
                {/* Educación y Experiencia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                        Educación
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-13">
                      {selectedCandidate.education}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                        Experiencia Política
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-13">
                      {selectedCandidate.experience}
                    </p>
                  </div>
                </div>

                {/* Propuestas */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                      Propuestas Principales
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCandidate.proposals.map((proposal, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/30 hover:shadow-md transition-all duration-200"
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-lg"
                          style={{ backgroundColor: selectedCandidate.color }}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {proposal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacto */}
                {selectedCandidate.social.website || selectedCandidate.social.email ? (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">Contacto</h3>
                    <div className="flex flex-wrap gap-4">
                      {selectedCandidate.social.website && (
                        <a 
                          href={selectedCandidate.social.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 font-medium"
                        >
                          <Globe className="h-4 w-4" />
                          Sitio web oficial
                        </a>
                      )}
                      {selectedCandidate.social.email && (
                        <a 
                          href={`mailto:${selectedCandidate.social.email}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 font-medium"
                        >
                          <Mail className="h-4 w-4" />
                          Enviar correo
                        </a>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de votación */}
      <Dialog open={voteModalOpen} onOpenChange={setVoteModalOpen}>
        <VoteModal 
          open={voteModalOpen} 
          onOpenChange={setVoteModalOpen}
          selectedCandidateId={selectedCandidateForVote}
          voterData={{
            dni: voterDni,
            nombre: voterName,
            apellidos: voterApellidos,
            fechaNacimiento: voterFechaNacimiento,
            region: voterRegion,
            distrito: voterDistrito
          }}
        />
      </Dialog>
    </div>
  );
}

