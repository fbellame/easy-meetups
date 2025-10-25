'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  MicrophoneIcon, 
  HomeIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline'
import { AuthButton } from './AuthButton'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Events', href: '/events', icon: CalendarDaysIcon },
  { name: 'Hosts', href: '/hosts', icon: UserGroupIcon },
  { name: 'Speakers', href: '/speakers', icon: MicrophoneIcon },
  { name: 'Community', href: '/community', icon: UserGroupIcon },
  { name: 'Announcements', href: '/announcements', icon: MegaphoneIcon },
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
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
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
