/**
 * TrainingMonitor Component
 * Monitor and visualize ML model training progress
 */

import React from 'react';
import { useModelTraining } from '../hooks/useModelTraining';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Play, Square, RotateCcw } from 'lucide-react';

export default function TrainingMonitor() {
  const {
    isTraining,
    trainingState,
    trainingMetrics,
    trainingHistory,
    startTraining,
    stopTraining,
    resetTraining,
    getTrainingStatus,
  } = useModelTraining();

  const status = getTrainingStatus();

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Training Monitor</h2>
        <div className="flex gap-2">
          {!isTraining ? (
            <Button
              size="sm"
              onClick={() =>
                startTraining({
                  modelName: 'ensemble',
                  epochs: 10,
                  batchSize: 32,
                })
              }
            >
              <Play className="w-4 h-4 mr-2" />
              Start Training
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={stopTraining}>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={resetTraining}
            disabled={!trainingState}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Training Status */}
      {trainingState && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Training Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium dark:text-slate-200">Progress</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {status.progress}%
                </span>
              </div>
              <Progress value={status.progress} className="h-3" />
            </div>

            {/* Training Info Grid */}
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Epoch</p>
                <p className="text-2xl font-bold dark:text-slate-100">
                  {status.epoch}/{status.totalEpochs}
                </p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Time</p>
                <p className="text-lg font-bold dark:text-slate-100">
                  {status.elapsedSeconds}s
                  {status.etaSeconds > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      / ~{status.etaSeconds}s remaining
                    </span>
                  )}
                </p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Status</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400 capitalize">
                  {status.status}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Train Loss:</span>
                <p className="font-bold dark:text-slate-100">{status.loss}</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Val Loss:</span>
                <p className="font-bold dark:text-slate-100">{status.valLoss}</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Accuracy:</span>
                <p className="font-bold text-green-600 dark:text-green-400">{status.accuracy}%</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Val Accuracy:</span>
                <p className="font-bold text-green-600 dark:text-green-400">
                  {status.valAccuracy}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training History Chart */}
      {trainingHistory.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Training Curves</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trainingHistory}>
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#ef4444"
                  name="Train Loss"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="valLoss"
                  stroke="#f97316"
                  name="Val Loss"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#22c55e"
                  name="Accuracy"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* No Training State */}
      {!trainingState && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No training session in progress
            </p>
            <Button
              onClick={() =>
                startTraining({
                  modelName: 'ensemble',
                  epochs: 10,
                  batchSize: 32,
                })
              }
            >
              <Play className="w-4 h-4 mr-2" />
              Start Training
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}