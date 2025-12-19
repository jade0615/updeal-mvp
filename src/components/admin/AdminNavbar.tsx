'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAdmin } from '@/actions/auth'

export default function AdminNavbar() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/admin' && pathname === '/admin') return true
        if (path !== '/admin' && pathname.startsWith(path)) return true
        return false
    }

    const navItems = [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Merchants', path: '/admin/merchants' },
        { name: 'Customers', path: '/admin/customers' },
        // { name: 'Analytics', path: '/admin/analytics' }, // Future
    ]

    return (
        <nav className="bg-white shadow mb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/admin" className="text-xl font-bold text-gray-900">
                            UpDeal 后台
                        </Link>

                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors ${isActive(item.path)
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={() => logoutAdmin()}
                            className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
