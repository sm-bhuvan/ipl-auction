"use client"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Server, Users, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()

  const handleCreateServer = () => {
    alert("Create Server functionality coming soon!")
  }

  const handleJoinServer = () => {
    router.push("/dashboard/join")
  }

  const handleLogout = () => {
    // Clear any stored user data here if needed
    router.push("/login")
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            IPL AUCTION
          </div>
          <p className="text-gray-300 text-lg">Choose your action</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl font-semibold">Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Create Server Button */}
            <Button
              onClick={handleCreateServer}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Server className="mr-3 h-5 w-5" />
              Create Server
            </Button>

            {/* Join Server Button */}
            <Button
              onClick={handleJoinServer}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
            >
              <Users className="mr-3 h-5 w-5" />
              Join Server
            </Button>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-14 bg-red-600 text-white border-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">Welcome to the ultimate cricket auction experience</p>
        </div>
      </div>
    </div>
  )
}
