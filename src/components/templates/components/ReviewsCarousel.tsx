import { Star } from 'lucide-react';
import type { MerchantContent } from '@/types/merchant';
import { generateAvatar } from '../utils/avatarGenerator';

interface ReviewsCarouselProps {
    reviews: MerchantContent['reviews'];
}

export default function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
    if (!reviews || reviews.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="mb-4 text-center text-lg font-bold text-gray-900">What People Say</h3>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={generateAvatar(review.authorName, 64)}
                                    alt={review.authorName}
                                    className="h-8 w-8 rounded-full"
                                />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{review.authorName}</h4>
                                    <span className="text-xs text-gray-500">{review.date}</span>
                                </div>
                            </div>
                            <div className="flex text-yellow-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm italic text-gray-700">&ldquo;{review.text}&rdquo;</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
