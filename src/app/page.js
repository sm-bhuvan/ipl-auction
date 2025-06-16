"use client"
import NAVBAR from "./Navbar"
import Welcome from "./welcome"
import Rules from "./Rules"
import Teams from "./Teams"
import Footer from "./Footer"


export default function IPLAuctionHomepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <NAVBAR/>
      <Welcome/>
      <Rules/>
      <Teams/>
      <Footer/>
    </div>
  )
}
