import { Clock, MapPin, Phone } from 'lucide-react';
import type { MerchantContent } from '@/types/merchant';

interface BusinessDetailsProps {
    openingHours: MerchantContent['openingHours'];
    address: MerchantContent['address'];
    phone: string;
    phoneNote?: string;
}

export default function BusinessDetails({
    openingHours,
    address,
    phone,
    phoneNote,
}: BusinessDetailsProps) {
    return (
        <div className="mb-8 space-y-4">
            {/* Address */}
            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm">
                    <MapPin className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-sm text-gray-600">{address.fullAddress}</p>
                    <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(address.fullAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        Get Directions →
                    </a>
                </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm">
                    <Clock className="h-5 w-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">Opening Hours</h4>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${openingHours.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {openingHours.currentStatus}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Closes at {openingHours.closingTime}</p>
                    {openingHours.specialHours && (
                        <p className="text-xs font-medium text-amber-600 mt-1">{openingHours.specialHours}</p>
                    )}
                </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm">
                    <Phone className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">Contact Us</h4>
                    <a href={`tel:${phone}`} className="text-lg font-bold text-indigo-600 hover:underline">
                        {phone}
                    </a>
                    {phoneNote && <p className="text-xs text-gray-500">{phoneNote}</p>}
                </div>
            </div>
        </div>
    );
}
