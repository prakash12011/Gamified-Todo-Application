'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { checkAuthStatus, handleAuthError, createClient } from '@/lib/supabase/client'
import { testTodoOperations } from '@/lib/supabase/todos'

interface AuthStatus {
  isAuthenticated: boolean
  userId?: string
  email?: string
  sessionExpiry?: string
  error?: string
}

interface TestResult {
  success: boolean
  userId?: string
  todoCount?: number
  error?: string
  message: string
}

export function AuthDebugPanel() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false })
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const { session, error } = await checkAuthStatus()
      
      if (error) {
        setAuthStatus({
          isAuthenticated: false,
          error: error?.message || 'Authentication error'
        })
      } else if (session?.user) {
        setAuthStatus({
          isAuthenticated: true,
          userId: session.user.id,
          email: session.user.email,
          sessionExpiry: new Date(session.expires_at! * 1000).toLocaleString()
        })
      } else {
        setAuthStatus({
          isAuthenticated: false,
          error: 'No session found'
        })
      }
    } catch (error) {
      setAuthStatus({
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testOperations = async () => {
    setIsLoading(true)
    try {
      const result = await testTodoOperations()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Test failed with exception'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearSession = async () => {
    setIsLoading(true)
    try {
      await handleAuthError()
      setAuthStatus({ isAuthenticated: false })
      setTestResult(null)
    } catch (error) {
      console.error('Error clearing session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        setAuthStatus({
          isAuthenticated: false,
          error: `Refresh failed: ${error.message}`
        })
      } else {
        await checkAuth()
      }
    } catch (error) {
      setAuthStatus({
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Refresh failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Authentication Debug Panel
          <Badge variant={authStatus.isAuthenticated ? 'default' : 'destructive'}>
            {authStatus.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Debug authentication status and token refresh issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auth Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Authentication Status</h4>
          {authStatus.isAuthenticated ? (
            <div className="space-y-1 text-sm">
              <p><strong>User ID:</strong> {authStatus.userId}</p>
              <p><strong>Email:</strong> {authStatus.email}</p>
              <p><strong>Session Expires:</strong> {authStatus.sessionExpiry}</p>
            </div>
          ) : (
            <div className="text-sm text-red-600">
              <p><strong>Error:</strong> {authStatus.error || 'No session'}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Test Results */}
        {testResult && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results</h4>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Status:</strong>{' '}
                <Badge variant={testResult.success ? 'default' : 'destructive'}>
                  {testResult.success ? 'Success' : 'Failed'}
                </Badge>
              </p>
              <p><strong>Message:</strong> {testResult.message}</p>
              {testResult.userId && <p><strong>User ID:</strong> {testResult.userId}</p>}
              {testResult.todoCount !== undefined && (
                <p><strong>Todo Count:</strong> {testResult.todoCount}</p>
              )}
              {testResult.error && (
                <p className="text-red-600"><strong>Error:</strong> {testResult.error}</p>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={checkAuth}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Checking...' : 'Check Auth Status'}
          </Button>
          
          <Button
            onClick={testOperations}
            disabled={isLoading || !authStatus.isAuthenticated}
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test Todo Operations'}
          </Button>

          <Button
            onClick={refreshToken}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Token'}
          </Button>

          <Button
            onClick={clearSession}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? 'Clearing...' : 'Clear Session'}
          </Button>
        </div>

        {/* Console Info */}
        <div className="text-xs text-gray-500 mt-4">
          <p>Check browser console for detailed logs during operations.</p>
          <p>Refresh token errors are automatically handled by signing out the user.</p>
        </div>
      </CardContent>
    </Card>
  )
}
