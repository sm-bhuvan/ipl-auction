import React from 'react'

const Playerinfo = ({name,role,prev,nationality}) => {
    return (
        <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{name}</h2>
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {prev}
                        </span>
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                            {role}
                        </span>
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                            {nationality}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Playerinfo