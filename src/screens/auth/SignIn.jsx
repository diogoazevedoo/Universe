import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext' 
import { db } from '../../firebase'

function SignIn() {

  const emailRef = useRef()
  const passwordRef = useRef()
  const { signin, currentUser } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
        setError('')
        setLoading(true)
        await signin(emailRef.current.value, passwordRef.current.value) //funçao de login do firebase com os dados inseridos

        //Verifica se o utilizador criou conta sem configurar o perfil e redireciona o para a pagina correta
        try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();

            if (userDoc.exists) {
                navigate('/teams');
            } else {
                navigate('/profile-details');
            }
        }
        catch (error) {
            console.error('Error fetching user profile data:', error);
        }
    } catch {
        setError('Failed to sign in')
    }
    finally {
        setLoading(false)
    }
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
                        Sign in to your account
                    </h1>

                    {error && <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">{error}</div>}

                    <form class="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                            <input ref={emailRef} type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5" placeholder="name@company.com" required />
                        </div>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                            <input ref={passwordRef} type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-800 focus:border-indigo-800 block w-full p-2.5" required />
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-start">
                                <div class="flex items-center h-5">
                                    <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300" />
                                </div>
                                <div class="ml-3 text-sm">
                                    <label for="remember" class="text-gray-500">Remember me</label>
                                </div>
                            </div>
                            <Link to="/forgot-password" class="text-sm font-medium text-primary-600 hover:underline">Forgot password?</Link>
                        </div>
                        <button disabled={loading} type="submit" class="w-full text-white bg-indigo-800 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Sign in</button>
                        <p class="text-sm font-light text-gray-500">
                            Don’t have an account yet? <Link to="/sign-up" class="font-medium text-primary-600 hover:underline">Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>
  )
}

export default SignIn
