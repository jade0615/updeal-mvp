import { OfferType } from '../templates/index'

interface OfferBadgeProps {
  type: OfferType
  value?: string
  badgeText?: string
  className?: string
}

export default function OfferBadge({ type, value, badgeText, className = '' }: OfferBadgeProps) {
  const getOfferConfig = () => {
    switch (type) {
      case 'discount':
        return {
          icon: '🏷️',
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          text: badgeText || value || '50% OFF'
        }
      case 'coupon':
        return {
          icon: '🎟️',
          bgColor: 'bg-purple-500',
          textColor: 'text-white',
          text: badgeText || value || 'Get $10 Off'
        }
      case 'bogo':
        return {
          icon: '🎁',
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          text: badgeText || value || 'Buy 1 Get 1 Free'
        }
      case 'reservation':
        return {
          icon: '📅',
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          text: badgeText || value || 'Book Now'
        }
      case 'free_item':
        return {
          icon: '🎉',
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          text: badgeText || value || 'Free Appetizer'
        }
      case 'bundle':
        return {
          icon: '📦',
          bgColor: 'bg-indigo-500',
          textColor: 'text-white',
          text: badgeText || value || '$29.99 Special'
        }
      default:
        return {
          icon: '🏷️',
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          text: badgeText || value || '50% OFF'
        }
    }
  }

  const config = getOfferConfig()

  return (
    <div className={`${config.bgColor} ${config.textColor} px-3 py-1 md:px-4 md:py-2 rounded-full shadow-lg ${className}`}>
      <span className="text-sm md:text-base font-bold">
        {config.icon} {config.text}
      </span>
    </div>
  )
}
