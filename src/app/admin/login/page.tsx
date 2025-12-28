'use client'

import { useState } from 'react'
import { loginAdmin } from '@/actions/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await loginAdmin(email, password)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
      // If success, logic inside loginAdmin redirects.
      // If it stays here without a redirect (unlikely if redirect works), we should reset loading.
      // Note: next/navigation redirect() throws an error that's caught here 
      // but usually the browser handles the jump before subsequent state updates.
    } catch (err: any) {
      // Re-throw if it's a redirect error (though usually not necessary in app router client components like this)
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err;
      }
      console.error('Login submission error:', err)
      setError(err?.message || '登录异常，请稍后重试')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">UpDeal 管理后台</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
