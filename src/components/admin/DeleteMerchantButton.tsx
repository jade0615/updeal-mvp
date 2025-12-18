'use client'

import { deleteMerchant } from '@/actions/merchants'

export default function DeleteMerchantButton({ merchantId }: { merchantId: string }) {
  const handleDelete = async () => {
    if (!confirm('确定要删除这个商家吗？')) {
      return
    }

    try {
      await deleteMerchant(merchantId)
    } catch (error) {
      console.error('Delete error:', error)
      alert('删除失败，请重试')
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-600 hover:text-red-900"
    >
      删除
    </button>
  )
}
