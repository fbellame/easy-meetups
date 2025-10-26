'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  MicrophoneIcon, 
  HomeIcon,
  MegaphoneIcon,
  BuildingOfficeIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { AuthButton } from './AuthButton'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, color: 'blue' },
  { name: 'Events', href: '/events', icon: CalendarDaysIcon, color: 'orange' },
  { name: 'Hosts', href: '/hosts', icon: BuildingOfficeIcon, color: 'purple' },
  { name: 'Speakers', href: '/speakers', icon: MicrophoneIcon, color: 'green' },
  { name: 'Community', href: '/community', icon: UsersIcon, color: 'blue' },
  { name: 'Announcements', href: '/announcements', icon: MegaphoneIcon, color: 'gray' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Easy Meetup</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                
                const colorClasses = {
                  blue: {
                    active: 'bg-blue-50 text-blue-700',
                    inactive: 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                    icon: 'text-blue-600'
                  },
                  orange: {
                    active: 'bg-orange-50 text-orange-700',
                    inactive: 'text-gray-700 hover:text-orange-700 hover:bg-orange-50',
                    icon: 'text-orange-600'
                  },
                  purple: {
                    active: 'bg-purple-50 text-purple-700',
                    inactive: 'text-gray-700 hover:text-purple-700 hover:bg-purple-50',
                    icon: 'text-purple-600'
                  },
                  green: {
                    active: 'bg-green-50 text-green-700',
                    inactive: 'text-gray-700 hover:text-green-700 hover:bg-green-50',
                    icon: 'text-green-600'
                  },
                  gray: {
                    active: 'bg-gray-50 text-gray-700',
                    inactive: 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
                    icon: 'text-gray-600'
                  }
                }
                
                const colors = colorClasses[item.color as keyof typeof colorClasses]
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? colors.active : colors.inactive
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? colors.icon : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
