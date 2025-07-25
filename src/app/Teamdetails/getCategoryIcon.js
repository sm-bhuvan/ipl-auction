import React from 'react'
import {
  Trophy,
  Users,
  DollarSign,
  Crown,
  Star,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Award,
} from "lucide-react"
const getCategoryIcon = ({category}) => {
    switch (category) {
        case "Batsman":
            return <Target className="w-3.5 h-3.5" />
        case "All-Rounder":
            return <Star className="w-3.5 h-3.5" />
        case "Fast Bowler":
            return <Zap className="w-3.5 h-3.5" />
        case "Spin Bowler":
            return <Shield className="w-3.5 h-3.5" />
        case "Wicket-Keeper":
            return <Shield className="w-3.5 h-3.5" />
        default:
            return <Users className="w-3.5 h-3.5" />
    }
}

export default getCategoryIcon