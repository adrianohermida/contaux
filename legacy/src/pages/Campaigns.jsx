/**
 * Campaigns Page
 * Marketing campaign management interface
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CampaignForm from '@/components/dashboard/CampaignForm';
import CampaignList from '@/components/dashboard/CampaignList';

export default function CampaignsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser?.workspace_id) {
          await base44.auth.redirectToLogin();
          return;
        }
        setUser(currentUser);
      } catch (error) {
        await base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  if (!user?.workspace_id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Acesso restrito</p>
      </div>
    );
  }

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCampaign(null);
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campanhas de Marketing</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Gerencie suas campanhas de email, SMS e redes sociais
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nova Campanha
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <CampaignForm
          campaign={editingCampaign}
          workspaceId={user.workspace_id}
          isOpen={showForm}
          onCancel={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Campaign List */}
      <CampaignList
        key={refreshKey}
        workspaceId={user.workspace_id}
        onEdit={handleEditCampaign}
        onRefresh={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}