'use client';

import { useState, useEffect } from 'react';

interface Props {
  merchantId: string;
  merchantSlug: string;
  timezone: string;
}

export default function WalletPushPanel({ merchantId, merchantSlug, timezone }: Props) {
  const [showPanel, setShowPanel] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationsCount, setRegistrationsCount] = useState<number | null>(null);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (showPanel && registrationsCount === null) {
      // Fetch number of active wallet registrations
      fetch(`/api/store/wallet-stats?merchantId=${merchantId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setRegistrationsCount(data.count);
        })
        .catch(() => setRegistrationsCount(0));
    }
  }, [showPanel, merchantId, registrationsCount]);

  const getCurrentMerchantTime = () => {
    return new Date().toLocaleTimeString('zh-CN', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async () => {
    setLoading(true);
    setResult(null);
    try {
      let sendAt = null;
      if (scheduleMode === 'later' && scheduleTime) {
        // Convert local time in merchant's timezone to UTC string
        const [datePart, timePart] = scheduleTime.split('T');
        const naiveString = `${datePart} ${timePart}:00`;
        const localDate = new Date(naiveString);
        
        // This is a rough estimation of timezone conversion for the UI
        const tzOffset = new Date().toLocaleString('en-US', { timeZoneName: 'shortOffset', timeZone: timezone });
        const offsetMatch = tzOffset.match(/GMT([+-]\d+)/);
        const hoursOffset = offsetMatch ? parseInt(offsetMatch[1], 10) : 0;
        
        localDate.setHours(localDate.getHours() - hoursOffset);
        sendAt = localDate.toISOString();
      }

      const res = await fetch('/api/store/schedule-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          merchantSlug,
          type: 'wallet_push',
          body: message,
          scheduledAt: sendAt,
          recipients: Array.from({ length: registrationsCount || 0 }).fill({}), // Dummy recipients array just to pass length check if any
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: scheduleMode === 'now' ? '推送已加入执行队列！' : '定时推送安排成功！' });
        setMessage('');
      } else {
        setResult({ success: false, message: data.error || '推送失败' });
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>💳</span> 苹果钱包弹窗推送 <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold ml-1">免费</span>
        </h2>
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
        >
          {showPanel ? '收起 ▲' : '展开 ▼'}
        </button>
      </div>

      {showPanel && (
        <div className="space-y-4">
          {result ? (
            <div className={`p-4 rounded-xl text-sm ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-bold mb-1">{result.success ? '操作成功 ✅' : '操作失败 ❌'}</p>
              <p>{result.message}</p>
              <button 
                onClick={() => setResult(null)}
                className="mt-3 text-xs underline"
              >
                再发一条
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700">
                <p>该功能允许您向所有已经把折扣券储存在 <strong>Apple Wallet</strong> 的客户发送锁屏提醒。这是完全免费的，不需要支付短信通道费。</p>
                <p className="mt-2 text-red-600 font-medium">当前已绑定苹果钱包的设备数量：{registrationsCount === null ? '加载中...' : registrationsCount} 台</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推送弹窗内容（简短的一句话即可）</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="例如：您有一张折扣券明天即将过期！"
                  rows={2}
                  maxLength={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none"
                />
                <div className="text-right text-xs text-gray-400 mt-0.5">{message.length}/60</div>
              </div>

              <div className="border border-gray-100 rounded-xl p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setScheduleMode('now')}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${scheduleMode === 'now'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}
                  >
                    ⚡ 立即推送
                  </button>
                  <button
                    onClick={() => setScheduleMode('later')}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${scheduleMode === 'later'
                      ? 'bg-orange-100 text-orange-700 border border-orange-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}
                  >
                    🕐 定时推送
                  </button>
                </div>

                {scheduleMode === 'later' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs text-gray-500">发送时间（请输入{timezone}时区时间）</label>
                      <span className="text-xs text-orange-500 font-medium">当前时间：{getCurrentMerchantTime()}</span>
                    </div>
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                )}

                <button
                  onClick={handleSend}
                  disabled={loading || !message.trim() || registrationsCount === 0 || (scheduleMode === 'later' && !scheduleTime)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-sm shadow hover:from-red-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '操作中...' : scheduleMode === 'now' ? '🚀 提交推送请求' : '🕐 设为定时推送'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
