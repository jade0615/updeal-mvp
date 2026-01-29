import { OfferType } from '../templates/index'

interface OfferCardProps {
  type: OfferType
  value: string
  title?: string
  description?: string
  className?: string
}

export default function OfferCard({ type, value, title, description, className = '' }: OfferCardProps) {
  const getOfferConfig = () => {
    switch (type) {
      case 'discount':
        return {
          icon: '🏷️',
          gradient: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
          borderColor: 'border-red-100 dark:border-red-800',
          badgeColor: 'bg-red-500',
          textColor: 'text-red-600 dark:text-red-400',
          defaultTitle: 'SPECIAL DISCOUNT',
          defaultBadgeText: value
        }
      case 'coupon':
        return {
          icon: '🎟️',
          gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          borderColor: 'border-purple-100 dark:border-purple-800',
          badgeColor: 'bg-purple-500',
          textColor: 'text-purple-600 dark:text-purple-400',
          defaultTitle: 'COUPON OFFER',
          defaultBadgeText: value
        }
      case 'bogo':
        return {
          icon: '🎁',
          gradient: 'from-orange-50/80 to-amber-50/80 dark:from-orange-900/20 dark:to-amber-900/20',
          borderColor: 'border-orange-200/70 dark:border-orange-800',
          badgeColor: 'bg-orange-400/90',
          textColor: 'text-orange-600 dark:text-orange-400',
          defaultTitle: 'BUY ONE GET ONE',
          defaultBadgeText: value
        }
      case 'reservation':
        return {
          icon: '📅',
          gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          borderColor: 'border-blue-100 dark:border-blue-800',
          badgeColor: 'bg-blue-500',
          textColor: 'text-blue-600 dark:text-blue-400',
          defaultTitle: 'RESERVATION SPECIAL',
          defaultBadgeText: 'Book Now'
        }
      case 'free_item':
        return {
          icon: '🎉',
          gradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
          borderColor: 'border-orange-100 dark:border-orange-800',
          badgeColor: 'bg-orange-500',
          textColor: 'text-orange-600 dark:text-orange-400',
          defaultTitle: 'FREE GIFT',
          defaultBadgeText: value
        }
      case 'bundle':
        return {
          icon: '📦',
          gradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
          borderColor: 'border-indigo-100 dark:border-indigo-800',
          badgeColor: 'bg-indigo-500',
          textColor: 'text-indigo-600 dark:text-indigo-400',
          defaultTitle: 'BUNDLE DEAL',
          defaultBadgeText: value
        }
      default:
        return {
          icon: '🏷️',
          gradient: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
          borderColor: 'border-red-100 dark:border-red-800',
          badgeColor: 'bg-red-500',
          textColor: 'text-red-600 dark:text-red-400',
          defaultTitle: 'SPECIAL OFFER',
          defaultBadgeText: value
        }
    }
  }

  const config = getOfferConfig()

  return (
    <div className={`bg-gradient-to-br ${config.gradient} rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg border ${config.borderColor} ${className}`}>
      {/* Header Badge */}
      <div className="text-center mb-6 md:mb-8">
        <div className={`inline-block ${config.badgeColor} text-white px-4 py-1 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider mb-3 md:mb-4`}>
          {config.icon} {title || config.defaultTitle}
        </div>

        {/* Main Value Display */}
        <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black ${config.textColor} mb-2 md:mb-3`}>
          {config.defaultBadgeText}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base lg:text-lg">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
