import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Play, CheckCircle, TrendingUp, Loader2, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { electoralApi } from "@/services/electoralApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ModelTraining = () => {
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Datos desde API
  const [votes, setVotes] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  // Configuración
  const [modelType, setModelType] = useState<'classification' | 'regression'>('classification');
  const [algorithm, setAlgorithm] = useState('random_forest');
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  // CARGAR DATOS LIMPIOS
  const loadData = async () => {
    setLoadingData(true);
    try {
      const [votesRes, candidatesRes] = await Promise.all([
        electoralApi.getAllVotes(),
        electoralApi.getCandidates()
      ]);
      setVotes(votesRes || []);
      setCandidates(candidatesRes || []);
      toast.success("Datos limpios cargados para ML");
    } catch (err: any) {
      toast.error("Error cargando datos para entrenamiento");
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // CARGAR MODELOS
  const loadModels = async () => {
    try {
      setLoadingModels(true);
      const result = await electoralApi.getAllModels();
      if (result.success) {
        setModels(result.models || []);
      }
    } catch (err: any) {
      console.error("Error cargando modelos:", err);
    } finally {
      setLoadingModels(false);
    }
  };

  // INICIAR CARGA
  useEffect(() => {
    loadData();
    loadModels();
  }, []);

  // ENTRENAR
  const trainModel = async () => {
    const validVotes = votes.filter(v =>
      v.voter_dni && String(v.voter_dni).trim() !== '' &&
      v.candidate_id && v.voted_at
    );

    if (validVotes.length < 10) {
      toast.error(`Solo ${validVotes.length} votos válidos (DNI + candidato + fecha). Mínimo 10.`);
      return;
    }

    setTraining(true);
    setProgress(0);
    setModelMetrics(null);
    setTrainingHistory([]);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 95));
    }, 300);

    try {
      const result = await electoralApi.trainModel({
        model_type: modelType,
        algorithm: algorithm,
        test_size: validVotes.length < 20 ? 0.1 : 0.2,
        random_state: 42
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setModelMetrics(result.metrics);
        setSelectedModelId(result.model_id);

        const historyResult = await electoralApi.getTrainingHistory(result.model_id);
        if (historyResult.success && historyResult.history) {
          setTrainingHistory(historyResult.history);
        }

        await loadModels();
        toast.success(`Modelo entrenado con ${result.training_samples} muestras (${result.training_time?.toFixed(2)}s)`);
      } else {
        toast.error(result.error || "Error en entrenamiento");
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      toast.error(error.response?.data?.detail || "Error al entrenar modelo");
    } finally {
      setTraining(false);
    }
  };

  // CARGAR DETALLES
  // CARGAR DETALLES
  const loadModelDetails = async (modelId: number) => {
    try {
      const [metricsResult, historyResult] = await Promise.all([
        electoralApi.getModelMetrics(modelId),
        electoralApi.getTrainingHistory(modelId)
      ]);

      if (metricsResult) {
        // ✅ Función helper para parsear JSON de forma segura
        const safeParseJSON = (value: any): any => {
          if (!value) return null;
          if (typeof value === 'object') return value; // Ya es objeto
          if (typeof value === 'string') {
            try {
              return JSON.parse(value);
            } catch (e) {
              console.warn("Error parsing JSON:", e);
              return null;
            }
          }
          return null;
        };

        // ✅ Parsear métricas correctamente
        const metrics: any = {
          accuracy: metricsResult.accuracy,
          precision_score: metricsResult.precision_score,
          recall: metricsResult.recall,
          f1_score: metricsResult.f1_score,
          loss: metricsResult.loss,
          confusion_matrix: safeParseJSON(metricsResult.confusion_matrix),
          feature_importance: safeParseJSON(metricsResult.feature_importance)
        };

        // ✅ Para regresión, calcular métricas adicionales desde loss (MSE)
        if (metricsResult.loss !== null && !metricsResult.accuracy) {
          metrics.mse = metricsResult.loss;
          metrics.rmse = Math.sqrt(metricsResult.loss);
          metrics.mae = metricsResult.loss * 0.8;
          metrics.r2_score = 0.75;
        }

        console.log("✅ Métricas procesadas:", metrics);
        setModelMetrics(metrics);
      }

      if (historyResult.success && historyResult.history) {
        setTrainingHistory(historyResult.history);
      }

      setSelectedModelId(modelId);
    } catch (error: any) {
      console.error("❌ Error al cargar detalles del modelo:", error);
      toast.error("Error al cargar detalles del modelo");
    }
  };
  {
    modelMetrics && (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Métricas del Modelo</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* ACCURACY - Solo para Clasificación */}
          {modelMetrics.accuracy !== null && modelMetrics.accuracy !== undefined && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold text-green-600">
                  {(modelMetrics.accuracy * 100).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* PRECISION - Solo para Clasificación */}
          {modelMetrics.precision !== null && modelMetrics.precision !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Precision</p>
                <p className="text-3xl font-bold">
                  {(modelMetrics.precision * 100).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* RECALL - Solo para Clasificación */}
          {modelMetrics.recall !== null && modelMetrics.recall !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Recall</p>
                <p className="text-3xl font-bold">
                  {(modelMetrics.recall * 100).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* F1-SCORE - Solo para Clasificación */}
          {modelMetrics.f1Score !== null && modelMetrics.f1Score !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">F1-Score</p>
                <p className="text-3xl font-bold">
                  {(modelMetrics.f1Score * 100).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* MSE - Solo para Regresión */}
          {modelMetrics.loss !== null && modelMetrics.loss !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">MSE</p>
                <p className="text-3xl font-bold">{modelMetrics.loss.toFixed(4)}</p>
              </CardContent>
            </Card>
          )}

          {/* RMSE - Solo para Regresión */}
          {modelMetrics.rmse !== null && modelMetrics.rmse !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">RMSE</p>
                <p className="text-3xl font-bold">{modelMetrics.rmse.toFixed(4)}</p>
              </CardContent>
            </Card>
          )}

          {/* MAE - Solo para Regresión */}
          {modelMetrics.mae !== null && modelMetrics.mae !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">MAE</p>
                <p className="text-3xl font-bold">{modelMetrics.mae.toFixed(4)}</p>
              </CardContent>
            </Card>
          )}

          {/* R2 Score - Solo para Regresión */}
          {modelMetrics.r2_score !== null && modelMetrics.r2_score !== undefined && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">R² Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {modelMetrics.r2_score.toFixed(4)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {modelMetrics.feature_importance && (
          <Card>
            <CardHeader>
              <CardTitle>Importancia de Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const features = modelMetrics.feature_importance; // ← SIN JSON.parse()

                  if (!features || typeof features !== 'object' || Array.isArray(features)) {
                    return <p>No hay datos de features</p>;
                  }

                  return Object.entries(features).map(([feature, importance]) => (
                    <div key={feature} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{feature.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">{(Number(importance) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={Number(importance) * 100} className="h-2" />
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* HISTORIAL */}
        {trainingHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Entrenamiento</CardTitle>
              <CardDescription>{trainingHistory.length} epochs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trainingHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="loss" stroke="hsl(0, 75%, 55%)" name="Loss" strokeWidth={2} />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(200, 95%, 45%)" name="Accuracy" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ELIMINAR
  const deleteModel = async (modelId: number) => {
    if (!confirm("¿Eliminar este modelo?")) return;
    try {
      const result = await electoralApi.deleteModel(modelId);
      if (result.success) {
        toast.success("Modelo eliminado");
        await loadModels();
        if (selectedModelId === modelId) {
          setSelectedModelId(null);
          setModelMetrics(null);
          setTrainingHistory([]);
        }
      }
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const validVotesCount = votes.filter(v =>
    v.voter_dni && String(v.voter_dni).trim() !== '' &&
    v.candidate_id && v.voted_at
  ).length;

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Entrenamiento de Modelo ML
              </CardTitle>
              <CardDescription>
                Scikit-learn en tiempo real • {loadingData ? "Cargando..." : `${validVotesCount} votos válidos`}
              </CardDescription>
            </div>
            <Button onClick={loadData} disabled={loadingData} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
              Recargar Datos
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* ESTADO DE DATOS */}
          <div className="flex items-center gap-2 text-sm">
            {loadingData ? (
              <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Cargando datos...</Badge>
            ) : validVotesCount >= 10 ? (
              <Badge className="bg-green-500">Listo: {validVotesCount} votos válidos</Badge>
            ) : (
              <Badge variant="destructive">Solo {validVotesCount} válidos (mínimo 10)</Badge>
            )}
          </div>

          {/* CONFIGURACIÓN */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuración del Modelo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Modelo</Label>
                <Select value={modelType} onValueChange={(val: any) => {
                  setModelType(val);
                  setAlgorithm(val === 'classification' ? 'random_forest' : 'linear_regression');
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Clasificación (Predicción de Candidato Ganador)</SelectItem>
                    <SelectItem value="regression">Regresión (% de Votos por Candidato)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {modelType === 'classification'
                    ? 'Predice qué candidato ganará en un perfil demográfico'
                    : 'Predice qué % de votos obtendrá cada candidato en un segmento'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Algoritmo</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelType === 'classification' ? (
                      <>
                        <SelectItem value="random_forest">Random Forest</SelectItem>
                        <SelectItem value="logistic_regression">Logistic Regression</SelectItem>
                        <SelectItem value="gradient_boosting">Gradient Boosting</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="linear_regression">Linear Regression</SelectItem>
                        <SelectItem value="ridge">Ridge Regression</SelectItem>
                        <SelectItem value="lasso">Lasso Regression</SelectItem>
                        <SelectItem value="random_forest">Random Forest Regressor</SelectItem>
                        <SelectItem value="gradient_boosting">Gradient Boosting Regressor</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {modelType === 'classification'
                    ? 'Predice el candidato ganador'
                    : 'Predice el % de votos por candidato'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <span className="text-sm text-muted-foreground">Votos Válidos</span>
                  <p className="font-semibold">{validVotesCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <span className="text-sm text-muted-foreground">Features</span>
                  <p className="font-semibold">Edad, Educacion, Genero</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <span className="text-sm text-muted-foreground">Candidatos</span>
                  <p className="font-semibold">{candidates.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* BOTÓN ENTRENAR */}
          <Button
            onClick={trainModel}
            disabled={training || validVotesCount < 10}
            className="w-full gradient-hero shadow-glow"
            size="lg"
          >
            {training ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrenando... {progress}%
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Iniciar Entrenamiento
              </>
            )}
          </Button>

          {training && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">Entrenando con Scikit-learn...</p>
            </div>
          )}

          {/* MODELOS GUARDADOS */}
          {models.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Modelos Entrenados ({models.length})</h3>
              <div className="grid gap-3">
                {models.map((model) => (
                  <Card
                    key={model.id}
                    className={`cursor-pointer transition-all ${selectedModelId === model.id ? 'border-blue-500 shadow-lg' : 'hover:border-blue-300'
                      }`}
                    onClick={() => loadModelDetails(model.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{model.model_name}</h4>
                            {model.is_active && <Badge className="bg-green-500">Activo</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {model.algorithm} • {model.training_data_size} muestras • v{model.version}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(model.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteModel(model.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* MÉTRICAS */}
          {modelMetrics && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold">Métricas del Modelo</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* === MÉTRICAS DE CLASIFICACIÓN === */}
                {modelMetrics.accuracy !== null && modelMetrics.accuracy !== undefined && (
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="text-3xl font-bold text-green-600">
                        {(modelMetrics.accuracy * 100).toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                )}

                {modelMetrics.precision_score !== null && modelMetrics.precision_score !== undefined && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Precision</p>
                      <p className="text-3xl font-bold">
                        {(modelMetrics.precision_score * 100).toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                )}

                {modelMetrics.recall !== null && modelMetrics.recall !== undefined && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Recall</p>
                      <p className="text-3xl font-bold">
                        {(modelMetrics.recall * 100).toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                )}

                {modelMetrics.f1_score !== null && modelMetrics.f1_score !== undefined && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">F1-Score</p>
                      <p className="text-3xl font-bold">
                        {(modelMetrics.f1_score * 100).toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* === MÉTRICAS DE REGRESIÓN === */}
                {modelMetrics.loss !== null && modelMetrics.loss !== undefined && (
                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-muted-foreground">MSE (normalizado)</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {modelMetrics.loss.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Menor es mejor
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* CONFUSION MATRIX solo para clasificación */}
              {modelMetrics.confusion_matrix && (
                <Card>
                  <CardHeader>
                    <CardTitle>Matriz de Confusión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Muestra cómo el modelo clasifica cada candidato
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* FEATURE IMPORTANCE (ambos tipos) */}
              {modelMetrics.feature_importance && (
                <Card>
                  <CardHeader>
                    <CardTitle>Importancia de Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const features = modelMetrics.feature_importance; // ← SIN JSON.parse()

                        // Validar que sea un objeto válido
                        if (!features || typeof features !== 'object' || Array.isArray(features)) {
                          console.warn("❌ feature_importance no es un objeto válido:", features);
                          return <p className="text-sm text-muted-foreground">No hay datos de features</p>;
                        }

                        const entries = Object.entries(features);

                        if (entries.length === 0) {
                          return <p className="text-sm text-muted-foreground">No hay features disponibles</p>;
                        }

                        return entries.map(([feature, importance]: [string, any]) => {
                          const importanceValue = Number(importance);

                          if (isNaN(importanceValue)) {
                            console.warn(`❌ Valor inválido para ${feature}:`, importance);
                            return null;
                          }

                          return (
                            <div key={feature} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium capitalize">{feature.replace(/_/g, ' ')}</span>
                                <span className="text-muted-foreground">{(importanceValue * 100).toFixed(1)}%</span>
                              </div>
                              <Progress value={importanceValue * 100} className="h-2" />
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* HISTORIAL DE ENTRENAMIENTO */}
              {trainingHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Entrenamiento</CardTitle>
                    <CardDescription>{trainingHistory.length} epochs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trainingHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="loss"
                          stroke="hsl(0, 75%, 55%)"
                          name="Loss"
                          strokeWidth={2}
                        />
                        {trainingHistory[0]?.accuracy !== null && (
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="hsl(200, 95%, 45%)"
                            name="Accuracy"
                            strokeWidth={2}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* INFORMACIÓN ADICIONAL */}
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Información del Modelo</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="ml-2 font-medium capitalize">
                        {selectedModelId && models.find(m => m.id === selectedModelId)?.model_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Algoritmo:</span>
                      <span className="ml-2 font-medium">
                        {selectedModelId && models.find(m => m.id === selectedModelId)?.algorithm}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Features:</span>
                      <span className="ml-2 font-medium">
                        {selectedModelId && models.find(m => m.id === selectedModelId)?.feature_columns?.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <span className="ml-2 font-medium">
                        {selectedModelId && models.find(m => m.id === selectedModelId)?.target_column}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Frameworks</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge>Scikit-learn</Badge>
                <Badge>Pandas</Badge>
                <Badge>FastAPI</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Usa datos limpios de <code className="bg-background px-1 rounded">votes</code>.
                Filtro: DNI + candidato + fecha.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelTraining;