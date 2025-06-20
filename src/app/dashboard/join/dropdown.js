import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



const Dropdown = ({onSelect,teams}) => {
    const [selectedTeam, setSelectedTeam] = useState(null)

    const handleSelect = (team) => {
        setSelectedTeam(team)
        onSelect?.(team)
    }

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {selectedTeam?
                    <button className={`px-4 py-2 rounded-md bg-gradient-to-br ${selectedTeam.color} text-white font-semibold shadow-md hover:brightness-110 transition cursor-pointer`}>{selectedTeam.name}</button>:
                    <button className="px-4 py-2 rounded-md bg-gradient-to-br from-indigo-600 to-blue-800 text-white font-semibold shadow-md hover:brightness-110 transition cursor-pointer">Select Your Team</button>
                    }
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {teams.map((team, i) => (
                        <DropdownMenuItem
                            key={i}
                            className="flex items-center space-x-2 cursor-pointer"
                            onClick={() => handleSelect(team)}
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl">
                                {team.logo}
                            </div>
                            <span className="font-bold">{team.code}</span>
                            <span className={`text-sm font-semibold bg-gradient-to-br ${team.color} bg-clip-text text-transparent`}>
                                {team.name}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default Dropdown
