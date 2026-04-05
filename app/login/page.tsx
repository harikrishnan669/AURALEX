"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Scale,
    Shield,
    Clock,
    Users,
    Zap,
    UserPlus,
} from "lucide-react"

import {
    registerUser,
    loginWithEmailOrUsername,
    onAuthChanged,
} from "@/lib/authFirebase"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function LoginPage() {
    const router = useRouter()

    const [showRegister, setShowRegister] = useState(false)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const [regUsername, setRegUsername] = useState("")
    const [regName, setRegName] = useState("")
    const [regEmail, setRegEmail] = useState("")
    const [regPassword, setRegPassword] = useState("")
    const [regConfirm, setRegConfirm] = useState("")
    const [regError, setRegError] = useState("")
    const [regSuccess, setRegSuccess] = useState("")
    const [regLoading, setRegLoading] = useState(false)
    const [regRole,setRegRole] = useState("")


    const ROLES = [
        { value: "constable", label: "Constable" },
        { value: "sub inspector", label: "Sub Inspector (SI)" },
        { value: "circle inspector", label: "Circle Inspector (CI)" },
        { value: "admin", label: "Admin Officer" },
    ]


    useEffect(() => {
        if (typeof window === "undefined") return
        const unsub = onAuthChanged((u) => {
            if (u) {
                router.replace("/login") // ensure dashboard route
            } else {
                const remember = localStorage.getItem("rememberEmail")
                if (remember) {
                    setEmail(remember)
                    setRememberMe(true)
                }
            }
        })
        return () => unsub?.()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setIsLoading(true)

        try {
            if (!email || !password) {
                setError("Please enter both email/username and password")
                setIsLoading(false)
                return
            }
            if (password.length < 6) {
                setError("Password must be at least 6 characters")
                setIsLoading(false)
                return
            }

            const user = await loginWithEmailOrUsername(email.trim(), password)

            if (user) {

                const userDoc = await getDoc(doc(db, "users", user.uid))
                const userData = userDoc.data()

                const profile = {
                    uid: user.uid,
                    email: user.email ?? "",
                    name: user.displayName ?? user.email ?? "",
                    role: userData?.role || "constable"
                }

                localStorage.setItem("user", JSON.stringify(profile))
                localStorage.setItem("isAuthenticated", "true")
            }

            if (rememberMe) localStorage.setItem("rememberEmail", email.trim())
            else localStorage.removeItem("rememberEmail")

            setSuccess("Login successful! Redirecting...")
            router.replace("/")
        } catch (err: any) {
            console.error("login error:", err)
            const message = err?.message ?? (err?.code ? `Error: ${err.code}` : "Login failed. Please check credentials.")
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setRegError("")
        setRegSuccess("")

        if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim() || !regConfirm.trim()) {
            setRegError("Please fill all required fields.")
            return
        }
        if (!regEmail.includes("@")) {
            setRegError("Please enter a valid email.")
            return
        }
        if (regPassword.length < 6) {
            setRegError("Password must be at least 6 characters.")
            return
        }
        if (regPassword !== regConfirm) {
            setRegError("Passwords do not match.")
            return
        }
        if (!regRole) {
            setRegError("Please select your role.")
            return
        }

        setRegLoading(true)
        try {
            await registerUser({
                email: regEmail.trim().toLowerCase(),
                password: regPassword,
                username: regUsername.trim(),
                name: regName.trim() || regUsername.trim(),
                role: regRole,
            })

            setRegSuccess("Account created successfully — returning to Sign In...")
            setTimeout(() => {
                setShowRegister(false)
                setEmail(regEmail.trim().toLowerCase())
                setPassword("")
                setSuccess("Account created. Please sign in.")
                setRegUsername("")
                setRegName("")
                setRegRole("")
                setRegEmail("")
                setRegPassword("")
                setRegConfirm("")
                setRegSuccess("")
                setRegError("")
            }, 900)
        } catch (err: any) {
            console.error(err)
            setRegError(err?.message ?? "Registration failed. Please try again.")
        } finally {
            setRegLoading(false)
        }
    }


    return (
        <div className="relative min-h-screen flex flex-col items-center px-7 lg:px-10 overflow-x-hidden">
            <div className="fixed inset-0 -z-10 bg-black overflow-hidden">

                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(135deg, white 0, white 1px, transparent 1px, transparent 160px)",
                    }}
                />
                <img
                    src="/lady.png"   //
                    alt="Justice Scale"
                    className="
      absolute top-1/2 left-[42%]
      -translate-x-1/2 -translate-y-1/2

      w-[300px] h-[500px]
      sm:w-[420px] sm:h-[420px]
      md:w-[520px] md:h-[520px]
      lg:h-[700px]

      opacity-[0.18]

      pointer-events-none
      select-none
    "
                />
            </div>
            <div className="w-full max-w-3xl z-20 lg:hidden flex items-center justify-center py-6 pt-10">
                <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-lg shadow">
                        <Scale className="h-8 w-8 text-black"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1ceff4] leading-none">AURALEX</h1>
                        <p className="text-xs text-blue-200">FIR Generator & Legal Analyzer</p>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-6xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <div className="hidden lg:flex flex-col justify-center space-y-8 pt-20">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-white p-3 rounded-xl shadow-lg">
                                    <Scale className="h-6 w-6 text-black"/>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-[#1ceff4]">AURALEX</h1>
                                    <p className="text-blue-200 text-sm">FIR Generator and Legal Section Analyzer</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="flex items-center justify-center h-12 w-12 rounded-lg bg-white opacity-80">
                                            <Zap className="h-6 w-6 text-black"/>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Lightning Fast</h3>
                                        <p className="text-blue-200 text-sm mt-1">Generate FIRs in seconds with AI</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="flex items-center justify-center h-12 w-12 rounded-lg bg-white opacity-80">
                                            <Shield className="h-6 w-6 text-black"/>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Secure & Safe</h3>
                                        <p className="text-blue-200 text-sm mt-1">Enterprise-grade security</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="flex items-center justify-center h-12 w-12 rounded-lg bg-white opacity-80">
                                            <Clock className="h-6 w-6 text-black"/>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">24/7 Available</h3>
                                        <p className="text-blue-200 text-sm mt-1">Access anytime, anywhere</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="flex items-center justify-center h-12 w-12 rounded-lg bg-white opacity-80">
                                            <Users className="h-6 w-6 text-black"/>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">For All Officers</h3>
                                        <p className="text-blue-200 text-sm mt-1">Designed for law enforcement</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex flex-col items-center justify-center w-full lg:overflow-visible overflow-hidden pt-10">
                        {!showRegister && (
                            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm mb-6">
                                <CardHeader className="space-y-2 pb-6">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="bg-black p-2 rounded-lg">
                                            <Scale className="h-6 w-6 text-white"/>
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                                    <CardDescription className="text-center text-base">Sign in to
                                        continue</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {error && (
                                        <Alert className="border-red-200 bg-red-50">
                                            <AlertCircle className="h-4 w-4 text-red-600"/>
                                            <div className="ml-2 text-red-800">{error}</div>
                                        </Alert>
                                    )}
                                    {success && (
                                        <Alert className="border-green-200 bg-green-50">
                                            <CheckCircle className="h-4 w-4 text-green-600"/>
                                            <div className="ml-2 text-green-800">{success}</div>
                                        </Alert>
                                    )}

                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-gray-700 font-medium">
                                                Username or Email
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                                                <Input
                                                    id="email"
                                                    type="text"
                                                    placeholder="username or officer@police.gov.in"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-10 h-11 border-gray-200 focus:border-black-500 focus:ring-gray-500"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-gray-700 font-medium">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="pl-10 pr-10 h-11 border-gray-200 focus:border-black-500 focus:ring-gray-500"
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                    disabled={isLoading}
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5"/> :
                                                        <Eye className="h-5 w-5"/>}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                id="remember"
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                disabled={isLoading}
                                            />
                                            <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                                                Remember me on this device
                                            </Label>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full h-11 bg-black hover:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Signing in...</span>
                                                    </div>
                                                ) : (
                                                    "Sign In"
                                                )}
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setShowRegister(true)
                                                    setError("")
                                                    setSuccess("")
                                                }}
                                                className="w-full h-11 px-0 justify-start text-black hover:bg-transparent hover:underline"
                                            >
                                                Register User
                                            </Button>
                                        </div>
                                    </form>

                                    <div className="text-center space-y-2 pt-2">
                                        <p className="text-xs text-gray-600">Developed by Team Anfield</p>
                                        <div
                                            className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                                            <a href="#" className="hover:text-gray-700">
                                                AURALEX
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {/*Register User Section*/}
                        {showRegister && (
                            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                                <CardHeader className="space-y-2 pb-4">
                                    <div className="flex items-center justify-center mb-2">
                                        <div className="bg-black p-2 rounded-lg">
                                            <UserPlus className="h-6 w-6 text-white"/>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-center">Create an account</CardTitle>
                                    <CardDescription className="text-center text-sm">Register to use the
                                        dashboard</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {regError && (
                                        <Alert className="border-red-200 bg-red-50">
                                            <AlertCircle className="h-4 w-4 text-red-600"/>
                                            <div className="ml-2 text-red-800">{regError}</div>
                                        </Alert>
                                    )}
                                    {regSuccess && (
                                        <Alert className="border-green-200 bg-green-50">
                                            <CheckCircle className="h-4 w-4 text-green-600"/>
                                            <div className="ml-2 text-green-800">{regSuccess}</div>
                                        </Alert>
                                    )}

                                    <form onSubmit={handleRegister} className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="regUsername" className="text-gray-700 font-medium">
                                                Username
                                            </Label>
                                            <Input id="regUsername" type="text" placeholder="Username"
                                                   value={regUsername} onChange={(e) => setRegUsername(e.target.value)}
                                                   disabled={regLoading}/>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="regName" className="text-gray-700 font-medium">
                                                Full name (optional)
                                            </Label>
                                            <Input id="regName" value={regName} placeholder="Full Name"
                                                   onChange={(e) => setRegName(e.target.value)} disabled={regLoading}/>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="regRole" className="text-gray-700 font-medium">
                                                Role / Position
                                            </Label>
                                            <select
                                                id="regRole"
                                                value={regRole}
                                                onChange={(e) => setRegRole(e.target.value)}
                                                disabled={regLoading}
                                                className="w-full h-11 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="">Select role</option>
                                                {ROLES.map((role) => (
                                                    <option key={role.value} value={role.value}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="regEmail" className="text-gray-700 font-medium">
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                                                <Input id="regEmail" type="email" placeholder="officer@police.gov.in"
                                                       value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                                                       className="pl-10 h-11" disabled={regLoading}/>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="regPassword" className="text-gray-700 font-medium">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                                                <Input id="regPassword" type="password"
                                                       placeholder="At least 6 characters" value={regPassword}
                                                       onChange={(e) => setRegPassword(e.target.value)}
                                                       className="pl-10 pr-10 h-11" disabled={regLoading}/>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="regConfirm" className="text-gray-700 font-medium">
                                                Confirm Password
                                            </Label>
                                            <Input id="regConfirm" type="password" placeholder="Repeat password"
                                                   value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                                                   disabled={regLoading}/>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="submit"
                                                disabled={regLoading}
                                                className="h-11 bg-black hover:to-gray-600 text-white font-semibold transition-all duration-200">
                                                {regLoading ? "Creating..." : "Create account"}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setShowRegister(false)
                                                    setRegError("")
                                                    setRegSuccess("")
                                                }}
                                                className="h-11 bg-black hover:to-gray-600 text-white font-semibold transition-all duration-200">
                                                Back to Sign In
                                            </Button>
                                        </div>

                                    </form>

                                    <div className="text-center text-xs text-gray-500 pt-2">
                                        <span>Already registered? Click Back to Sign In to login.</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
