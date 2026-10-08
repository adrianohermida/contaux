/**
 * EnterpriseSecurityPanel Component
 * SSO configuration, MFA setup, session management, and security policies
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Lock,
  Shield,
  Key,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Mail,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useEnterpriseSSOManager } from '@/components/hooks/useEnterpriseSSOManager';

export default function EnterpriseSecurityPanel() {
  const {
    ssoState,
    providers,
    mfaMethods,
    auditLog,
    initiateOAuth2,
    initiateSAML,
    setupMFA,
    verifyMFA,
    logout,
    refreshSession,
    getUserInfo,
    getSessionStatus,
  } = useEnterpriseSSOManager();

  const [activeTab, setActiveTab] = useState('sso');
  const [mfaToken, setMfaToken] = useState('');
  const [showMFACode, setShowMFACode] = useState(false);
  const [selectedMFAMethod, setSelectedMFAMethod] = useState(null);

  const sessionStatus = getSessionStatus();
  const userInfo = getUserInfo();

  const handleOAuth2Login = async (providerId) => {
    await initiateOAuth2(providerId);
  };

  const handleSAMLLogin = async (providerId) => {
    await initiateSAML(providerId);
  };

  const handleMFASetup = async (method) => {
    const result = await setupMFA(method);
    setSelectedMFAMethod(result);
  };

  const handleMFAVerify = async () => {
    await verifyMFA(mfaToken);
    setMfaToken('');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          Enterprise Security
        </h2>
        <Badge className={ssoState.isAuthenticated ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-gray-100 text-gray-800 dark:bg-gray-900'}>
          {ssoState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </Badge>
      </div>

      {/* Session Status */}
      {ssoState.isAuthenticated && (
        <Card className="dark:bg-slate-800 dark:border-slate-700 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-slate-100">{userInfo?.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{userInfo?.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Provider: {userInfo?.provider}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="dark:border-slate-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                  <p className="text-slate-600 dark:text-slate-400">Session Status</p>
                  <p className="font-medium dark:text-slate-100">
                    {sessionStatus.sessionValid ? '✓ Valid' : '✗ Invalid'}
                  </p>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                  <p className="text-slate-600 dark:text-slate-400">MFA Status</p>
                  <p className="font-medium dark:text-slate-100">
                    {sessionStatus.mfaVerified ? '✓ Verified' : '⚠ Required'}
                  </p>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                  <p className="text-slate-600 dark:text-slate-400">Expires In</p>
                  <p className="font-medium dark:text-slate-100 text-xs">
                    {Math.floor(sessionStatus.timeUntilExpiry / 60000)}m
                  </p>
                </div>
                <Button
                  onClick={refreshSession}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="dark:bg-slate-800 dark:border-slate-700 grid w-full grid-cols-4">
          <TabsTrigger value="sso" className="dark:text-slate-300">
            <Lock className="w-4 h-4 mr-2" />
            SSO
          </TabsTrigger>
          <TabsTrigger value="mfa" className="dark:text-slate-300">
            <Key className="w-4 h-4 mr-2" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="providers" className="dark:text-slate-300">
            <Users className="w-4 h-4 mr-2" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="audit" className="dark:text-slate-300">
            <Clock className="w-4 h-4 mr-2" />
            Audit
          </TabsTrigger>
        </TabsList>

        {/* SSO Tab */}
        <TabsContent value="sso" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Single Sign-On</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!ssoState.isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sign in with your enterprise account
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleOAuth2Login('google')}
                      className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      Google
                    </Button>
                    <Button
                      onClick={() => handleOAuth2Login('microsoft')}
                      className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      Microsoft
                    </Button>
                    <Button
                      onClick={() => handleSAMLLogin('okta')}
                      className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      Okta
                    </Button>
                    <Button
                      onClick={() => handleSAMLLogin('azure-ad')}
                      className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      Azure AD
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium dark:text-slate-100">SSO Authenticated</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      You are securely logged in
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MFA Tab */}
        <TabsContent value="mfa" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-500" />
                Multi-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ssoState.mfaRequired && !ssoState.mfaVerified ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium dark:text-slate-100">MFA Required</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Please verify your identity using one of your registered methods
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-slate-100">
                      Enter Verification Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showMFACode ? 'text' : 'password'}
                          placeholder="000000"
                          value={mfaToken}
                          onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 text-center text-2xl tracking-widest"
                          maxLength="6"
                        />
                        <button
                          onClick={() => setShowMFACode(!showMFACode)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400"
                        >
                          {showMFACode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <Button
                        onClick={handleMFAVerify}
                        disabled={mfaToken.length !== 6}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-opacity-80"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mfaMethods.map((method) => (
                      <Button
                        key={method.id}
                        onClick={() => handleMFASetup(method.id)}
                        className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 h-auto py-4 flex items-center gap-3 justify-start px-4"
                      >
                        {method.id === 'totp' && <Smartphone className="w-5 h-5 text-purple-500" />}
                        {method.id === 'sms' && <Mail className="w-5 h-5 text-blue-500" />}
                        {method.id === 'email' && <Mail className="w-5 h-5 text-green-500" />}
                        {method.id === 'backup' && <Key className="w-5 h-5 text-orange-500" />}
                        <div className="text-left">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-xs opacity-70">{method.type}</p>
                        </div>
                      </Button>
                    ))}
                  </div>

                  {selectedMFAMethod && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <p className="font-medium dark:text-slate-100 mb-2">
                        {selectedMFAMethod.method} Setup
                      </p>
                      {selectedMFAMethod.qrCode && (
                        <img src={selectedMFAMethod.qrCode} alt="QR Code" className="w-32 h-32 mb-3" />
                      )}
                      {selectedMFAMethod.backupCodes && (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Backup Codes:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            {selectedMFAMethod.backupCodes.map((code) => (
                              <span key={code} className="dark:text-slate-300">
                                {code}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Identity Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded"
                  >
                    <div>
                      <p className="font-medium dark:text-slate-100">{provider.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{provider.type}</p>
                    </div>
                    <Badge className={provider.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-gray-100 text-gray-800 dark:bg-gray-900'}>
                      {provider.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Security Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLog.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No audit events yet
                  </p>
                ) : (
                  auditLog.slice(0, 20).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-2 bg-slate-100 dark:bg-slate-700 rounded text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium dark:text-slate-100">{event.action}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Status Summary */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
              <p className="text-slate-600 dark:text-slate-400 mb-1">Authentication</p>
              <p className="font-medium dark:text-slate-100">
                {ssoState.isAuthenticated ? '✓ Secured' : '⚠ Not Protected'}
              </p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
              <p className="text-slate-600 dark:text-slate-400 mb-1">Multi-Factor</p>
              <p className="font-medium dark:text-slate-100">
                {ssoState.mfaVerified ? '✓ Active' : '⚠ Inactive'}
              </p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
              <p className="text-slate-600 dark:text-slate-400 mb-1">Session</p>
              <p className="font-medium dark:text-slate-100">
                {sessionStatus.sessionValid ? '✓ Valid' : '✗ Expired'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}