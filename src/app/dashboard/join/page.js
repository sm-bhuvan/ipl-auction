"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


const join = () => {
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
            <CardTitle className="text-white text-2xl font-semibold">Enter the Server Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <form onSubmit={()=>{handleSubmit}}>
              <input
              type="text"
              placeholder="Enter Server Code"
              className="w-full h-14 bg-white/20 text-white placeholder-gray-400 border border-white/30 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"></input>
              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 mt-4">Submit</button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">Build your Favorite IPL team to glory!</p>
        </div>
      </div>
    </div>
  )
}

export default join