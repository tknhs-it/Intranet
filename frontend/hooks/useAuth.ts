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
          setAccessToken(response.accessToken)
        })
        .catch((error) => {
          console.error('Token acquisition failed:', error)
        })
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
      await instance.logoutRedirect()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return {
    isAuthenticated,
    account,
    accessToken,
    login,
    logout,
  }
}

