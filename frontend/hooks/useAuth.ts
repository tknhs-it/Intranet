'use client'

import { useMsal } from '@azure/msal-react'
import { useAccount, useIsAuthenticated } from '@azure/msal-react'
import { loginRequest } from '@/lib/msal'
import { useEffect, useState } from 'react'

export function useAuth() {
  const { instance, accounts } = useMsal()
  const account = useAccount(accounts[0] || {})
  const isAuthenticated = useIsAuthenticated()
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && account) {
      // Get access token
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: account,
        })
        .then((response) => {
          console.log('Access token acquired successfully')
          setAccessToken(response.accessToken)
        })
        .catch((error) => {
          console.error('Token acquisition failed:', error)
          // If silent acquisition fails, try interactive login
          if (error.errorCode === 'interaction_required' || error.errorCode === 'consent_required') {
            console.log('Silent token acquisition failed, attempting interactive login...')
            instance.acquireTokenRedirect(loginRequest).catch((redirectError) => {
              console.error('Interactive login failed:', redirectError)
            })
          }
        })
    } else if (!isAuthenticated) {
      // Clear token when not authenticated
      setAccessToken(null)
    }
  }, [isAuthenticated, account, instance])

  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const logout = async () => {
    try {
      // Clear all accounts and tokens from cache
      const accounts = instance.getAllAccounts()
      if (accounts.length > 0) {
        await instance.logoutRedirect({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin,
        })
      } else {
        // If no accounts, just clear cache
        instance.clearCache()
        window.location.reload()
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Fallback: clear cache and reload
      instance.clearCache()
      window.location.reload()
    }
  }
  
  const clearCache = () => {
    instance.clearCache()
    setAccessToken(null)
    window.location.reload()
  }

  return {
    isAuthenticated,
    account,
    accessToken,
    login,
    logout,
    clearCache,
  }
}

