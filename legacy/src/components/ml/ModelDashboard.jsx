/**
 * ModelDashboard Component
 * Display and manage ML models
 */

import React, { useState } from 'react';
import { useMLModel } from '../hooks/useMLModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Brain, BarChart3, Zap } from 'lucide-react';

export default function ModelDashboard({ workspaceId }) {
  const { models, loadModel, getModelInfo, unloadModel, loadedModels, currentModel } =
    useMLModel(workspaceId);
  const [selectedModel, setSelectedModel] = useState(null);

  const handleLoadModel = async (modelKey) => {
    try {
      await loadModel(modelKey);
      setSelectedModel(modelKey);
    } catch (error) {
      console.error('Failed to load model:', error);
    }
  };

  const handleUnloadModel = (modelKey) => {
    unloadModel(modelKey);
    if (selectedModel === modelKey) {
      setSelectedModel(null);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.9) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 0.8) return 'text-blue-600 dark:text-blue-400';
    if (accuracy >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const selectedModelInfo = selectedModel ? getModelInfo(selectedModel) : null;

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">ML Models</h2>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {loadedModels.length} loaded
          </span>
        </div>
      </div>

      {/* Selected Model Details */}
      {selectedModelInfo && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-blue-200 bg-blue-50 dark:border-blue-900">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base dark:text-slate-100">
                  {selectedModelInfo.name}
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedModelInfo.description}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                v{selectedModelInfo.version}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Info Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">
                  Accuracy
                </p>
                <p className={`text-2xl font-bold ${getAccuracyColor(selectedModelInfo.accuracy)}`}>
                  {(selectedModelInfo.accuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">
                  Model Size
                </p>
                <p className="text-2xl font-bold dark:text-slate-100">{selectedModelInfo.size}</p>
              </div>
            </div>

            {/* Inference Metrics */}
            {selectedModelInfo.metrics && selectedModelInfo.metrics.totalInferences > 0 && (
              <div className="p-3 bg-white dark:bg-slate-700 rounded-lg space-y-2">
                <p className="text-sm font-medium dark:text-slate-200">Inference Metrics</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Total:</span>
                    <p className="font-bold dark:text-slate-100">
                      {selectedModelInfo.metrics.totalInferences}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Avg Latency:</span>
                    <p className="font-bold dark:text-slate-100">
                      {selectedModelInfo.metrics.avgLatency.toFixed(2)}ms
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Min:</span>
                    <p className="font-bold dark:text-slate-100">
                      {selectedModelInfo.metrics.minLatency.toFixed(2)}ms
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Max:</span>
                    <p className="font-bold dark:text-slate-100">
                      {selectedModelInfo.metrics.maxLatency.toFixed(2)}ms
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Models List */}
      <div className="space-y-3">
        {models.length === 0 ? (
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No models available</p>
            </CardContent>
          </Card>
        ) : (
          models.map((model) => (
            <Card
              key={model.key}
              className={`dark:border-slate-700 cursor-pointer transition-all ${
                model.loaded
                  ? 'dark:bg-slate-700 border-green-200 bg-green-50 dark:border-green-900'
                  : 'dark:bg-slate-800'
              }`}
              onClick={() => model.loaded && setSelectedModel(model.key)}
            >
              <CardContent className="pt-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium dark:text-slate-100">{model.name}</h3>
                    {model.loaded && (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                    {model.current && (
                      <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{model.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Accuracy:{' '}
                      <span className={`font-bold ${getAccuracyColor(model.accuracy)}`}>
                        {(model.accuracy * 100).toFixed(1)}%
                      </span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Size: {model.size}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {model.loaded ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnloadModel(model.key);
                      }}
                    >
                      Unload
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadModel(model.key);
                      }}
                    >
                      Load
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}