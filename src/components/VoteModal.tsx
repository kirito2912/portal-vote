// components/VoteModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, Vote, User, Shield } from "lucide-react";
import { toast } from "sonner";

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

interface VoterData {
  dni: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  region: string;
  distrito: string;
}

interface VoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCandidateId: number | null;
  voterData: VoterData;
}

// Datos de candidatos (DEBEN COINCIDIR EXACTAMENTE con los del VotePage)
const allCandidates: Candidate[] = [
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
  },
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
  },
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

export default function VoteModal({ 
  open, 
  onOpenChange, 
  selectedCandidateId, 
  voterData 
}: VoteModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar el candidato cuando cambia el selectedCandidateId
  useEffect(() => {
    if (selectedCandidateId && open) {
      const candidate = allCandidates.find(c => c.id === selectedCandidateId);
      if (candidate) {
        setSelectedCandidate(candidate);
      } else {
        console.error("Candidato no encontrado:", selectedCandidateId);
        setSelectedCandidate(null);
        toast.error("No se pudo cargar la información del candidato");
      }
    } else {
      setSelectedCandidate(null);
    }
  }, [selectedCandidateId, open]);

  const handleConfirmVote = async () => {
    if (!selectedCandidate) {
      toast.error("No se ha seleccionado ningún candidato");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular envío del voto
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la llamada a la API real
      console.log("Voto registrado:", {
        candidate: selectedCandidate,
        voter: voterData
      });

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span>¡Voto registrado exitosamente!</span>
        </div>,
        {
          duration: 5000,
        }
      );

      // Cerrar modal después de votar
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error al registrar voto:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <span>Error al registrar el voto. Intente nuevamente.</span>
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Vote className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Confirmar Voto
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 dark:text-gray-300">
            Verifique su selección antes de confirmar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del votante */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Datos del Votante</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p><strong>DNI:</strong> {voterData.dni}</p>
              <p><strong>Nombre:</strong> {voterData.nombre} {voterData.apellidos}</p>
              <p><strong>Ubicación:</strong> {voterData.distrito}, {voterData.region}</p>
            </div>
          </div>

          {/* Información del candidato */}
          {selectedCandidate ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-700">
                  <AvatarImage src={selectedCandidate.photo} alt={selectedCandidate.name} />
                  <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 font-semibold">
                    {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {selectedCandidate.name}
                    </h3>
                    <Badge 
                      style={{ backgroundColor: selectedCandidate.color }} 
                      className="text-white text-xs"
                    >
                      {selectedCandidate.party}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {selectedCandidate.bio}
                  </p>
                </div>
              </div>
              
              {/* Propuesta principal */}
              {selectedCandidate.proposals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Propuesta principal:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCandidate.proposals[0]}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    No se pudo cargar la información del candidato seleccionado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Advertencia */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  ¡Atención!
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Una vez confirmado, su voto no podrá ser modificado. Esta acción es irreversible.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-0">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmVote}
            disabled={!selectedCandidate || isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Registrando voto...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Voto
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}