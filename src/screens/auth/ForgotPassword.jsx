import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function ForgotPassword() {

  const { resetPassword } = useAuth()
  const email = useRef('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    try {
        setMessage('')
        setError('')
        setLoading(true)
        await resetPassword(email.current.value)
        setMessage('Check your inbox for further instructions')
    } catch {
        setMessage('')
        setError('Failed to reset password')
    }
    setLoading(false)
  }

  return (
    <section class="bg-indigo-800 w-full h-full">
      <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" class="flex items-center -mt-8 -mb-2 -ml-7 text-2xl font-semibold text-gray-900">
            <img class="w-24" src="icon-white.png" alt="logo" />
            <span className='text-white -ml-3'>UniVerse</span>    
        </a>
        <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Reset your password
            </h1>

            {error && <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">{error}</div>}

            {message && <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role='status'>{message}</div>}

            <form class="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="displayName" class="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                <input ref={email} type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5" placeholder="name@company.com" required />
              </div>

              <button disabled={loading} type="submit" class="w-full text-white bg-indigo-800 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Reset Password</button>

              <p class="text-sm font-light text-gray-500">
                Go back to <Link to="/sign-in" class="font-medium text-primary-600 hover:underline">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForgotPassword
