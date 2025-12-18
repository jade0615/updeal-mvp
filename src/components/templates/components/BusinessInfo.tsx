import { MapPin, Star } from 'lucide-react';
import type { MerchantContent } from '@/types/merchant';

interface BusinessInfoProps {
    logoUrl?: string;
    name: string;
    type: string;
    priceRange: string;
    rating: number;
    reviewCount: string;
    address: MerchantContent['address'];
    establishedYear: number;
}

export default function BusinessInfo({
    logoUrl,
    name,
    type,
    priceRange,
    rating,
    reviewCount,
    address,
    establishedYear,
}: BusinessInfoProps) {
    return (
        <div className="mb-6 text-center">
            {/* Logo */}
            {logoUrl && (
                <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-md">
                    <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
                </div>
            )}

            {/* Name */}
            <h1 className="mb-2 font-serif text-3xl font-bold text-gray-900 md:text-4xl">
                {name}
            </h1>

            {/* Meta Info */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
                <span>{type}</span>
                <span>•</span>
                <span>{priceRange}</span>
                <span>•</span>
                <span>Est. {establishedYear}</span>
            </div>

            {/* Rating & Location */}
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                    <div className="flex text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 font-semibold text-gray-900">{rating}</span>
                    </div>
                    <span className="text-gray-500">({reviewCount} reviews)</span>
                </div>

                <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(address.fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                    <MapPin className="h-4 w-4" />
                    <span>{address.street}, {address.area}</span>
                </a>
            </div>
        </div>
    );
}
