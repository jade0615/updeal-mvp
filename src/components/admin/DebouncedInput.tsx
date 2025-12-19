'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

interface Props {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    debounce?: number
}

export default function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 300,
    placeholder,
    className,
    ...props
}: Props & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value, debounce, onChange])

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
                {...props}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        </div>
    )
}
