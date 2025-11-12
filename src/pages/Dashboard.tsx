import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, BarChart3, Users, Shield, Calendar, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Seguridad Militar",
      description: "Cifrado AES-256 y verificación blockchain para máxima seguridad",
      gradient: "from-blue-600 to-blue-800"
    },
    {
      icon: BarChart3,
      title: "Transparencia Total",
      description: "Auditoría en tiempo real y resultados verificables públicamente",
      gradient: "from-green-600 to-green-800"
    },
    {
      icon: Users,
      title: "Acceso Universal",
      description: "Plataforma accesible para todos los ciudadanos habilitados",
      gradient: "from-purple-600 to-purple-800"
    }
  ];

  const elections = [
    {
      title: "Elección Presidencial 2025",
      status: "active",
      description: "Elección del Presidente de la República",
      start: "15 Nov 2025 - 08:00",
      end: "15 Nov 2025 - 20:00",
      candidates: 4,
      progress: 65
    },
    {
      title: "Elección Congresal",
      status: "active", 
      description: "Elección de Representantes al Congreso",
      start: "15 Nov 2025 - 08:00",
      end: "15 Nov 2025 - 20:00",
      candidates: 120,
      progress: 42
    },
    {
      title: "Elección Regional",
      status: "completed",
      description: "Elección de Gobernadores Regionales",
      start: "10 Oct 2025 - 08:00",
      end: "10 Oct 2025 - 20:00", 
      candidates: 25,
      progress: 100
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      {/* Header Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-blue-900/90 border-b border-blue-700/50">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Calendar className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">Proceso Electoral 2025 - En Curso</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Sistema Electoral
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                Nacional
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Plataforma oficial de votación digital del Estado. 
              <strong className="text-white"> Seguro</strong>, 
              <strong className="text-white"> Transparente</strong>, 
              <strong className="text-white"> Verificable</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/vote")}
                className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                <Vote className="mr-3 h-6 w-6" />
                Emitir Mi Voto
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/results")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-8 py-3 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                <BarChart3 className="mr-3 h-6 w-6" />
                Ver Resultados en Tiempo Real
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
    

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Elections Section */}
      <section className="container mx-auto px-4 py-16 bg-white/5 backdrop-blur-sm border-t border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Procesos Electorales
            </h2>
            <p className="text-xl text-gray-300">
              Participa en las elecciones nacionales y regionales
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {elections.map((election, index) => (
              <Card key={index} className={`border-2 ${
                election.status === 'active' 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-gray-500/50 bg-gray-500/5'
              } backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{election.title}</CardTitle>
                    <Badge className={
                      election.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }>
                      {election.status === 'active' ? 'En Curso' : 'Finalizado'}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-300">
                    {election.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white">
                      <span>Inicio:</span>
                      <span className="font-medium">{election.start}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Cierre:</span>
                      <span className="font-medium">{election.end}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Candidatos:</span>
                      <span className="font-medium">{election.candidates}</span>
                    </div>
                  </div>
                  
                  {election.status === 'active' && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span>Progreso de Votación</span>
                        <span>{election.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${election.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¡Tu Voto Es Tu Voz!
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Participa en la construcción democrática de nuestro país. 
              Cada voto cuenta en la toma de decisiones nacional.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/vote")}
              className="bg-white text-blue-900 hover:bg-blue-50 px-12 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
            >
              <Vote className="mr-3 h-6 w-6" />
              Ir a la Cabina de Votación
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}