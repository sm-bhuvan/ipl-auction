import React from 'react'

const getTypeColor = ({type}) => {
    switch (type) {
      case "capped":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "uncapped":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "overseas":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

export default getTypeColor