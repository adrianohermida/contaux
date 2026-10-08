import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, TrendingUp, Award, Zap } from 'lucide-react';

export default function CustomerPointsDashboard({ customerId, loyaltyProgramId, workspaceId }) {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: customerPoints } = useQuery({
    queryKey: ['customerPoints', customerId],
    queryFn: () =>
      base44.entities.CustomerPoints.filter({
        id: customerId,
        workspace_id: workspaceId,
      }),
    select: (data) => data?.[0],
  });

  const { data: program } = useQuery({
    queryKey: ['loyaltyProgram', loyaltyProgramId],
    queryFn: () =>
      base44.entities.LoyaltyProgram.filter({
        id: loyaltyProgramId,
        workspace_id: workspaceId,
      }),
    select: (data) => data?.[0],
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ['availableRewards', loyaltyProgramId],
    queryFn: () =>
      base44.entities.RewardRedemption.filter({
        loyalty_program_id: loyaltyProgramId,
        status: 'approved',
      }),
  });

  // Find next tier
  const nextTier = useMemo(() => {
    if (!program?.tiers || !customerPoints?.tier) return null;

    const currentTierIndex = program.tiers.findIndex((t) => t.name === customerPoints.tier);
    if (currentTierIndex === -1 || currentTierIndex === 0) return null;

    const next = program.tiers[currentTierIndex - 1];
    const progress =
      ((customerPoints.lifetime_points - program.tiers[currentTierIndex].min_points) /
        (next.min_points - program.tiers[currentTierIndex].min_points)) *
      100;

    return { ...next, progress: Math.min(100, Math.max(0, progress)) };
  }, [program, customerPoints]);

  const redeemMutation = useMutation({
    mutationFn: (rewardId) => base44.entities.RewardRedemption.update(rewardId, { status: 'used' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerPoints'] });
      queryClient.invalidateQueries({ queryKey: ['availableRewards'] });
    },
  });

  if (!customerPoints || !program) {
    return <div className="text-center py-8">Carregando dados de fidelização...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Points Card */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 border-none">
        <CardContent className="pt-8 pb-8 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-2">Saldo Atual</p>
            <h2 className="text-5xl font-bold mb-2">{customerPoints.current_points.toLocaleString()}</h2>
            <p className="text-sm opacity-75">de {program.name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tier Progress */}
      {customerPoints.tier && (
        <Card className="dark:bg-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5" />
              Tier Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">
                {customerPoints.tier}
              </span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {customerPoints.lifetime_points.toLocaleString()} pts
              </Badge>
            </div>

            {nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Progresso para {nextTier.name}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{Math.round(nextTier.progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${nextTier.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {nextTier.min_points - customerPoints.lifetime_points} pontos restantes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="dark:bg-slate-800">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Ganho</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {customerPoints.lifetime_points.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800">
          <CardContent className="pt-6 text-center">
            <Zap className="w-5 h-5 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Resgatado</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {customerPoints.points_redeemed.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 col-span-2 md:col-span-1">
          <CardContent className="pt-6 text-center">
            <Gift className="w-5 h-5 mx-auto mb-2 text-pink-600 dark:text-pink-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Disponível</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {rewards.filter((r) => r.status === 'approved').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Rewards */}
      {rewards.length > 0 && (
        <Card className="dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Recompensas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{reward.reward_type}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {reward.points_redeemed} pontos • R$ {reward.reward_value?.toFixed(2)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => redeemMutation.mutate(reward.id)}
                  disabled={customerPoints.current_points < reward.points_redeemed}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label={`Redeem ${reward.reward_type}`}
                >
                  Resgatar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Member Since */}
      {customerPoints.member_since && (
        <Card className="dark:bg-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Membro desde{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(customerPoints.member_since).toLocaleDateString('pt-BR')}
              </span>
            </p>
            {customerPoints.last_activity_date && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Última atividade:{' '}
                <span className="font-medium text-slate-900 dark:text-white">
                  {new Date(customerPoints.last_activity_date).toLocaleDateString('pt-BR')}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}