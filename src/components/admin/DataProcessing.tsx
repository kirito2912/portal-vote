import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, CheckCircle, AlertCircle, Loader2, Table, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { electoralApi } from "@/services/electoralApi";

const DataProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = async () => {
    setLoadingVotes(true);
    try {
      const result = await electoralApi.getAllVotes();
      setVotes(result || []);
    } catch (err: any) {
      toast.error("Error cargando votos");
      console.error(err);
    } finally {
      setLoadingVotes(false);
    }
  };

  const analyzeDataQuality = async () => {
    setProcessing(true);
    try {
      const result = await electoralApi.analyzeDataQuality();
      if (result.success) {
        setDataQuality(result);
        toast.success("Análisis completado");
        loadVotes();
      } else {
        toast.error(result.message || "Error en análisis");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error del servidor");
    } finally {
      setProcessing(false);
    }
  };

  const cleanData = async () => {
    setProcessing(true);
    try {
      const result = await electoralApi.cleanNullData();
      toast.success(result.message);
      await loadVotes();
      await analyzeDataQuality();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error limpiando datos");
    } finally {
      setProcessing(false);
    }
  };

  const removeDuplicates = async () => {
    setProcessing(true);
    try {
      const result = await electoralApi.removeDuplicates();
      toast.success(result.message);
      await loadVotes();
      await analyzeDataQuality();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error eliminando duplicados");
    } finally {
      setProcessing(false);
    }
  };

  const normalizeData = async () => {
    setProcessing(true);
    try {
      const result = await electoralApi.normalizeData();
      toast.success(result.message);
      await loadVotes();
      await analyzeDataQuality();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error normalizando");
    } finally {
      setProcessing(false);
    }
  };

  const filteredVotes = votes.filter(vote =>
    vote.voter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vote.voter_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vote.voter_dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vote.voter_location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVotes = filteredVotes.slice(startIndex, startIndex + itemsPerPage);

  // Detectar problemas - ACTUALIZADO para incluir DNI
  const getVoteIssues = (vote: any) => {
    const issues = [];
    
    const isNullOrEmpty = (val: any) => {
      if (val === null || val === undefined) return true;
      const str = String(val).trim();
      return str === '' || str.toUpperCase() === 'N/A';
    };
    
    if (isNullOrEmpty(vote.voter_name)) {
      issues.push("Sin nombre");
    }
    
    if (isNullOrEmpty(vote.voter_dni)) {
      issues.push("Sin DNI");
    }
    
    if (isNullOrEmpty(vote.voter_email)) {
      issues.push("Sin email");
    } else if (!String(vote.voter_email).includes("@")) {
      issues.push("Email inválido");
    }
    
    if (isNullOrEmpty(vote.voter_location)) {
      issues.push("Sin ubicación");
    }
    
    if (vote.candidate_id === null || vote.candidate_id === undefined) {
      issues.push("Sin candidato");
    }

    // Duplicados (solo si tiene email válido)
    if (vote.voter_email && !isNullOrEmpty(vote.voter_email)) {
      const duplicates = votes.filter(v => v.voter_email === vote.voter_email);
      if (duplicates.length > 1) issues.push("Duplicado");
    }

    return issues;
  };
  
  // Mostrar valores - ACTUALIZADO para resaltar 'N/A'
  const displayValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-red-600 font-semibold">NULL</span>;
    }
    const str = String(value).trim();
    if (str === '') {
      return <span className="text-orange-600 font-semibold">VACÍO</span>;
    }
    if (str.toUpperCase() === 'N/A') {
      return <span className="text-blue-600 font-semibold">N/A</span>;
    }
    return value;
  };

  const exportToCSV = () => {
    const headers = ["ID", "Nombre", "DNI", "Email", "Ubicación", "Candidato", "Fecha", "Problemas"];
    const rows = filteredVotes.map(vote => [
      vote.id,
      vote.voter_name || "N/A",
      vote.voter_dni || "N/A",
      vote.voter_email || "N/A",
      vote.voter_location || "N/A",
      vote.candidate_id || "N/A",
      new Date(vote.voted_at).toLocaleString(),
      getVoteIssues(vote).join(", ") || "Ninguno"
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `votos_procesamiento_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("CSV exportado exitosamente");
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Database className="w-6 h-6" />
            Procesamiento de Datos
          </CardTitle>
          <CardDescription>
            Análisis y limpieza de datos electorales (Pandas + Supabase)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Button onClick={analyzeDataQuality} disabled={processing} className="gradient-hero">
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Analizar Calidad
            </Button>
            <Button onClick={cleanData} disabled={processing || !dataQuality} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reemplazar Null → N/A
            </Button>
            <Button onClick={removeDuplicates} disabled={processing || !dataQuality} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Quitar Duplicados
            </Button>
            <Button onClick={normalizeData} disabled={processing || !dataQuality} variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Normalizar
            </Button>
          </div>

          {dataQuality && dataQuality.success && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reporte de Calidad de Datos</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Total de Registros */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total de Registros</span>
                      <Badge variant="outline">{dataQuality.total_records}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Registros Completos (sin NULL ni N/A) */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Registros Completos</span>
                      <Badge className="bg-green-500">
                        {dataQuality.complete_records} ({dataQuality.quality_score}%)
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Datos NULL (valores realmente nulos) */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Datos NULL</span>
                      <Badge variant={dataQuality.missing_data > 0 ? "destructive" : "outline"}>
                        {dataQuality.missing_data}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Campos vacíos o nulos sin procesar
                    </p>
                  </CardContent>
                </Card>

                {/* Datos con N/A (ya procesados) */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Datos con N/A</span>
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        {votes.filter(v => {
                          const str = (val: any) => String(val || '').trim().toUpperCase();
                          return str(v.voter_name) === 'N/A' || 
                                 str(v.voter_dni) === 'N/A' || 
                                 str(v.voter_email) === 'N/A' || 
                                 str(v.voter_location) === 'N/A';
                        }).length}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Datos ya reemplazados anteriormente
                    </p>
                  </CardContent>
                </Card>

                {/* Emails Válidos */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Emails Válidos</span>
                      <Badge className="bg-blue-500">{dataQuality.valid_emails}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Emails con formato correcto (@)
                    </p>
                  </CardContent>
                </Card>

                {/* Duplicados */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duplicados</span>
                      <Badge variant={dataQuality.duplicates > 0 ? "destructive" : "outline"}>
                        {dataQuality.duplicates}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Emails repetidos (excluyendo N/A)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Card de Calidad General */}
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        Calidad: {dataQuality.quality_score >= 90 ? "Excelente" : dataQuality.quality_score >= 70 ? "Buena" : "Mejorable"}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {dataQuality.complete_records} registros sin NULL listos para análisis ML
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Proceso Real (Pandas + Supabase)
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Los datos NULL se reemplazan con "N/A" (incluyendo DNI)</li>
                <li>• Se registra auditoría en tabla null_data_votes</li>
                <li>• Los registros permanecen en la base de datos</li>
                <li>• Status visual: OK si no hay NULL, Warning si hay N/A</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Table className="w-6 h-6" />
                Datos en Procesamiento
              </CardTitle>
              <CardDescription>
                {loadingVotes ? "Cargando..." : `${votes.length} votos • N/A indica datos reemplazados`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadVotes} disabled={loadingVotes} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingVotes ? 'animate-spin' : ''}`} />
                Recargar
              </Button>
              <Button onClick={() => setShowTable(!showTable)} variant="outline">
                {showTable ? "Ocultar" : "Mostrar"} Tabla
              </Button>
            </div>
          </div>
        </CardHeader>

        {showTable && (
          <CardContent className="space-y-4">
            {loadingVotes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : votes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay votos registrados</p>
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, DNI, email o ubicación..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button onClick={exportToCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">ID</th>
                        <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                        <th className="px-4 py-3 text-left font-semibold">Edad</th>
                        <th className="px-4 py-3 text-left font-semibold">Genero</th>
                        <th className="px-4 py-3 text-left font-semibold">Educacion</th>
                        <th className="px-4 py-3 text-left font-semibold">DNI</th>
                        <th className="px-4 py-3 text-left font-semibold">Email</th>
                        <th className="px-4 py-3 text-left font-semibold">Ubicación</th>
                        <th className="px-4 py-3 text-left font-semibold">Candidato</th>
                        <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                        <th className="px-4 py-3 text-left font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedVotes.map((vote, index) => {
                        const issues = getVoteIssues(vote);
                        const hasIssues = issues.length > 0;

                        return (
                          <tr key={vote.id} className={`hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                            <td className="px-4 py-3 font-mono text-xs">{vote.id}</td>
                            <td className="px-4 py-3">{displayValue(vote.voter_name)}</td>
                            <td className="px-4 py-3">{displayValue(vote.voter_edad)}</td>
                            <td className="px-4 py-3">{displayValue(vote.voter_genero)}</td>
                            <td className="px-4 py-3">{displayValue(vote.voter_educacion)}</td>
                            <td className="px-4 py-3 font-mono">{displayValue(vote.voter_dni)}</td>
                            <td className="px-4 py-3">{displayValue(vote.voter_email)}</td>
                            <td className="px-4 py-3">{displayValue(vote.voter_location)}</td>
                            <td className="px-4 py-3 font-mono text-xs">{vote.candidate_id || "N/A"}</td>
                            <td className="px-4 py-3 text-xs">{new Date(vote.voted_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</td>
                            <td className="px-4 py-3">
                              {hasIssues ? (
                                <div className="flex flex-wrap gap-1">
                                  {issues.map((issue, i) => (
                                    <Badge key={i} variant="destructive" className="text-xs">
                                      {issue}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  OK
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredVotes.length)} de {filteredVotes.length} votos
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Anterior
                    </Button>
                    <span className="px-4 py-2 text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Votos OK</p>
                      <p className="text-2xl font-bold text-green-600">
                        {votes.filter(v => getVoteIssues(v).length === 0).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Con N/A</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {votes.filter(v => {
                          const str = (val: any) => String(val || '').trim().toUpperCase();
                          return str(v.voter_name) === 'N/A' || 
                                 str(v.voter_dni) === 'N/A' || 
                                 str(v.voter_email) === 'N/A' || 
                                 str(v.voter_location) === 'N/A';
                        }).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Duplicados</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {votes.length - new Set(votes.map(v => v.voter_email)).size}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Con problemas</p>
                      <p className="text-2xl font-bold text-red-600">
                        {votes.filter(v => getVoteIssues(v).length > 0).length}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DataProcessing;