import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const syncBankAccountData = async (base44, bankAccount) => {
  try {
    // Mock sync: In production, this would integrate with bank APIs
    const mockTransactions = [
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Client Payment',
        amount: Math.random() * 5000,
        type: 'credit'
      },
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Service Fee',
        amount: Math.random() * 500,
        type: 'debit'
      }
    ];

    const balanceChange = mockTransactions.reduce((sum, t) => {
      return sum + (t.type === 'credit' ? t.amount : -t.amount);
    }, 0);

    const updatedBalance = (bankAccount.balance || 0) + balanceChange;
    await base44.asServiceRole.entities.BankAccount.update(bankAccount.id, {
      balance: updatedBalance
    });

    return {
      accountNumber: bankAccount.account_number,
      success: true,
      previousBalance: bankAccount.balance,
      newBalance: updatedBalance,
      changeAmount: balanceChange
    };
  } catch (error) {
    return {
      accountNumber: bankAccount.account_number,
      success: false,
      error: error.message
    };
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let tenantId, bankAccountId;
    
    try {
      const body = await req.json();
      tenantId = body.tenantId;
      bankAccountId = body.bankAccountId;
    } catch {
      // Empty body - automated run
    }

    // Case 1: Sync specific bank account
    if (bankAccountId && tenantId) {
      const bankAccount = await base44.asServiceRole.entities.BankAccount.get(bankAccountId);
      if (!bankAccount || bankAccount.tenant_id !== tenantId) {
        return Response.json({ error: 'Bank account not found' }, { status: 404 });
      }

      const result = await syncBankAccountData(base44, bankAccount);
      return Response.json({ success: result.success, result });
    }

    // Case 2: Automated run - sync all active bank accounts
    const allBankAccounts = await base44.asServiceRole.entities.BankAccount.list('-created_date', 1000);

    if (allBankAccounts.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No active bank accounts to sync',
        syncedCount: 0
      });
    }

    let syncResults = [];
    const tenantMap = {};

    // Process each bank account and group by tenant
    for (const bankAccount of allBankAccounts) {
      const result = await syncBankAccountData(base44, bankAccount);
      syncResults.push(result);

      if (!tenantMap[bankAccount.tenant_id]) {
        tenantMap[bankAccount.tenant_id] = { success: 0, total: 0 };
      }
      tenantMap[bankAccount.tenant_id].total++;
      if (result.success) tenantMap[bankAccount.tenant_id].success++;
    }

    // Create notifications per tenant
    for (const [tId, stats] of Object.entries(tenantMap)) {
      const message = `${stats.success} de ${stats.total} contas bancárias sincronizadas com sucesso`;
      await base44.asServiceRole.entities.Notification.create({
        tenant_id: tId,
        user_email: 'system@contaux.local',
        title: 'Sincronização Bancária',
        message: message,
        type: 'info',
        priority: 'low',
        status: 'sent'
      });
    }

    const totalSuccess = syncResults.filter(r => r.success).length;
    return Response.json({ 
      success: true, 
      message: `Sincronização completa: ${totalSuccess}/${syncResults.length} contas`,
      syncedCount: totalSuccess,
      results: syncResults
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});