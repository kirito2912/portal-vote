// src/services/electoralApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ============ INTERFACES ============

export interface VoteData {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  departamento: string;
  provincia: string;
  distrito: string;
  edad: number;          // ← AGREGAR
  genero: string;        // ← AGREGAR
  educacion: string;     // ← AGREGAR
  candidate_id: number;
}

export interface TrainModelRequest {
  model_type: 'classification' | 'regression';
  algorithm: string;
  test_size?: number;
  random_state?: number;
}

export interface TrainModelResponse {
  success: boolean;
  model_id?: number;
  session_id?: number;
  metrics?: {
    accuracy?: number;
    precision_score?: number;
    recall?: number;
    f1_score?: number;
    mse?: number;
    rmse?: number;
    mae?: number;
    r2_score?: number;
    confusion_matrix?: number[][];
    feature_importance?: Record<string, number>;
  };
  training_time?: number;
  training_samples?: number;
  test_samples?: number;
  message?: string;
  error?: string;
}

export interface ModelDetails {
  id: number;
  model_name: string;
  model_type: string;
  version: string;
  algorithm: string;
  hyperparameters: string;
  feature_columns: string[];
  target_column: string;
  training_data_size: number;
  is_active: boolean;
  created_at: string;
  created_by: number | null;
}

export interface ModelMetrics {
  id: number;
  model_id: number;
  training_session_id: number;
  accuracy: number | null;
  precision_score: number | null;
  recall: number | null;
  f1_score: number | null;
  loss: number | null;
  confusion_matrix: string | null;
  feature_importance: string | null;
  recorded_at: string;
}

export interface TrainingHistory {
  id: number;
  training_session_id: number;
  epoch: number;
  loss: number;
  accuracy: number;
  val_loss: number | null;
  val_accuracy: number | null;
  learning_rate: number | null;
  recorded_at: string;
}

// ============ CLASE DE SERVICIO ============

class ElectoralApiService {
  
  // ============ VOTOS ============
  
  /**
   * Registra un nuevo voto
   */
  async submitVote(voteData: VoteData) {
    const response = await axios.post(`${API_URL}/votes`, voteData);
    return response.data;
  }

  /**
   * Verifica si un DNI o email ya votó
   */
  async checkIfVoted(dni: string, email: string): Promise<boolean> {
    const response = await axios.get(`${API_URL}/votes/check`, {
      params: { dni, email }
    });
    return response.data.has_voted;
  }

  /**
   * Obtiene todos los votos
   */
  async getAllVotes() {
    const response = await axios.get(`${API_URL}/votes`);
    return response.data;
  }

  // ============ RESULTADOS ============
  
  /**
   * Obtiene los resultados electorales en tiempo real
   */
  async getResults() {
    const response = await axios.get(`${API_URL}/results`);
    return response.data;
  }

  /**
   * Obtiene la lista de candidatos
   */
  async getCandidates() {
    const response = await axios.get(`${API_URL}/candidates`);
    return response.data;
  }

  // ============ LIMPIEZA DE DATOS ============
  
  /**
   * Analiza la calidad de los datos
   */
  async analyzeDataQuality() {
    const response = await axios.get(`${API_URL}/analyze`);
    return response.data;
  }

  /**
   * Limpia datos nulos reemplazándolos con 'N/A'
   */
  async cleanNullData() {
    const response = await axios.post(`${API_URL}/clean-null`);
    return response.data;
  }

  /**
   * Elimina votos duplicados
   */
  async removeDuplicates() {
    const response = await axios.post(`${API_URL}/remove-duplicates`);
    return response.data;
  }

  /**
   * Normaliza los datos (capitalización, limpieza de espacios)
   */
  async normalizeData() {
    const response = await axios.post(`${API_URL}/normalize`);
    return response.data;
  }

  // ============ MACHINE LEARNING ============
  
  /**
   * Entrena un nuevo modelo de ML
   * 
   * @param request - Configuración del modelo
   * @returns Respuesta con métricas y detalles del entrenamiento
   * 
   * @example
   * ```typescript
   * const result = await electoralApi.trainModel({
   *   model_type: 'classification',
   *   algorithm: 'random_forest',
   *   test_size: 0.2,
   *   random_state: 42
   * });
   * ```
   */
  async trainModel(request: TrainModelRequest): Promise<TrainModelResponse> {
    const response = await axios.post(`${API_URL}/train`, request);
    return response.data;
  }

  /**
   * Obtiene todos los modelos entrenados
   * 
   * @returns Lista de modelos con sus detalles
   */
  async getAllModels(): Promise<{
    success: boolean;
    models: ModelDetails[];
    total: number;
  }> {
    const response = await axios.get(`${API_URL}/models`);
    return response.data;
  }

  /**
   * Obtiene los detalles de un modelo específico
   * 
   * @param modelId - ID del modelo
   * @returns Detalles completos del modelo
   */
  async getModelDetails(modelId: number): Promise<ModelDetails> {
    const response = await axios.get(`${API_URL}/models/${modelId}`);
    return response.data;
  }

  /**
   * Obtiene las métricas de un modelo
   * 
   * @param modelId - ID del modelo
   * @returns Métricas de evaluación (accuracy, precision, recall, etc.)
   */
  async getModelMetrics(modelId: number): Promise<ModelMetrics | null> {
    const response = await axios.get(`${API_URL}/models/${modelId}/metrics`);
    return response.data;
  }

  /**
   * Obtiene el historial de entrenamiento de un modelo
   * 
   * @param modelId - ID del modelo
   * @returns Historial de epochs con loss y accuracy
   */
  async getTrainingHistory(modelId: number): Promise<{
    success: boolean;
    history: TrainingHistory[];
  }> {
    const response = await axios.get(`${API_URL}/models/${modelId}/history`);
    return response.data;
  }

  /**
   * Realiza predicciones con un modelo entrenado
   * 
   * @param modelId - ID del modelo
   * @param features - Features para predecir
   * @returns Predicción del modelo
   * 
   * @note Actualmente no implementado - requiere serialización de modelo
   */
  async predict(modelId: number, features: Record<string, any>): Promise<{
    success: boolean;
    prediction?: any;
    error?: string;
  }> {
    const response = await axios.post(`${API_URL}/predict`, {
      model_id: modelId,
      features
    });
    return response.data;
  }

  /**
   * Elimina un modelo
   * 
   * @param modelId - ID del modelo a eliminar
   * @returns Confirmación de eliminación
   */
  async deleteModel(modelId: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const response = await axios.delete(`${API_URL}/models/${modelId}`);
    return response.data;
  }

  // ============ UTILIDADES ============
  
  /**
   * Verifica el estado de salud de la API
   */
  async healthCheck() {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
    return response.data;
  }
  // ============ ANALYTICS ============
  
  /**
   * Obtiene resumen general (KPIs)
   */
  async getAnalyticsOverview() {
    const response = await axios.get(`${API_URL}/analytics/overview`);
    return response.data;
  }

  /**
   * Análisis demográfico detallado
   */
  async getAnalyticsDemographic() {
    const response = await axios.get(`${API_URL}/analytics/demographic`);
    return response.data;
  }

  /**
   * Análisis geográfico
   */
  async getAnalyticsGeographic(departamento?: string, provincia?: string) {
    const response = await axios.get(`${API_URL}/analytics/geographic`, {
      params: { departamento, provincia }
    });
    return response.data;
  }

  /**
   * Análisis temporal
   */
  async getAnalyticsTemporal() {
    const response = await axios.get(`${API_URL}/analytics/temporal`);
    return response.data;
  }

  /**
   * Desempeño por candidato
   */
  async getAnalyticsCandidates() {
    const response = await axios.get(`${API_URL}/analytics/candidates`);
    return response.data;
  }

  /**
   * Clustering K-Means
   */
  async getAnalyticsClustering(n_clusters: number = 3) {
    const response = await axios.get(`${API_URL}/analytics/clustering`, {
      params: { n_clusters }
    });
    return response.data;
  }

  /**
   * Matriz de correlaciones
   */
  async getAnalyticsCorrelations() {
    const response = await axios.get(`${API_URL}/analytics/correlations`);
    return response.data;
  }

  /**
   * Predicciones ML
   */
  async getAnalyticsPredictions() {
    const response = await axios.get(`${API_URL}/analytics/predictions`);
    return response.data;
  }
}

// ============ EXPORTAR INSTANCIA ============

/**
 * Instancia única del servicio de API Electoral
 * 
 * @example
 * ```typescript
 * import { electoralApi } from '@/services/electoralApi';
 * 
 * // Entrenar modelo
 * const result = await electoralApi.trainModel({
 *   model_type: 'classification',
 *   algorithm: 'random_forest'
 * });
 * 
 * // Obtener modelos
 * const models = await electoralApi.getAllModels();
 * ```
 */
export const electoralApi = new ElectoralApiService();

// ============ CONSTANTES ============

/**
 * Algoritmos disponibles por tipo de modelo
 */
export const AVAILABLE_ALGORITHMS = {
  classification: [
    { value: 'random_forest', label: 'Random Forest' },
    { value: 'logistic_regression', label: 'Logistic Regression' },
    { value: 'gradient_boosting', label: 'Gradient Boosting' }
  ],
  regression: [
    { value: 'linear_regression', label: 'Linear Regression' },
    { value: 'ridge', label: 'Ridge Regression' },
    { value: 'lasso', label: 'Lasso Regression' }
  ]
} as const;

/**
 * Tipos de modelos disponibles
 */
export const MODEL_TYPES = {
  classification: 'Clasificación',
  regression: 'Regresión'
} as const;