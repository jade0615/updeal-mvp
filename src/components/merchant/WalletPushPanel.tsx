'use client';

import { useState, useEffect } from 'react';

interface WalletCustomer {
  registrationId: string;
  pushToken: string;
  couponId: string;
  customerName: string;
}

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
  const [customers, setCustomers] = useState<WalletCustomer[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customersLoading, setCustomersLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (showPanel && customers.length === 0) {
      setCustomersLoading(true);
      fetch(`/api/store/wallet-stats?merchantId=${merchantId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCustomers(data.customers || []);
            // Default: select all
            setSelected(new Set((data.customers || []).map((c: WalletCustomer) => c.registrationId)));
          }
        })
        .catch(() => {})
        .finally(() => setCustomersLoading(false));
    }
  }, [showPanel, merchantId, customers.length]);

  const getCurrentMerchantTime = () => {
    return new Date().toLocaleTimeString('zh-CN', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
  };

  const toggleAll = () => {
    if (selected.size === customers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(customers.map(c => c.registrationId)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSend = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const selectedTokens = customers
        .filter(c => selected.has(c.registrationId))
        .map(c => c.pushToken);

      let sendAt = null;
      if (scheduleMode === 'later' && scheduleTime) {
        const [datePart, timePart] = scheduleTime.split('T');
        const naiveString = `${datePart} ${timePart}:00`;
        const localDate = new Date(naiveString);
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
          recipients: selectedTokens.map(token => ({ token })),
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: scheduleMode === 'now' ? `已向 ${selected.size} 位客户提交推送！` : `定时推送已安排！` });
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
              <button onClick={() => setResult(null)} className="mt-3 text-xs underline">再发一条</button>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-600">
                向已把折扣券添加到 <strong>Apple Wallet</strong> 的客户发送锁屏提醒，完全免费。
              </div>

              {/* Customer Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    选择收件人（{selected.size}/{customers.length}）
                  </span>
                  {customers.length > 0 && (
                    <button onClick={toggleAll} className="text-xs text-red-600 underline">
                      {selected.size === customers.length ? '取消全选' : '全选'}
                    </button>
                  )}
                </div>
                {customersLoading ? (
                  <p className="text-sm text-gray-400 py-2">加载中...</p>
                ) : customers.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">暂无客户添加了苹果钱包</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
                    {customers.map((c) => (
                      <label key={c.registrationId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected.has(c.registrationId)}
                          onChange={() => toggleOne(c.registrationId)}
                          className="accent-red-600"
                        />
                        <span className="text-sm font-medium text-gray-800">{c.customerName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推送内容（简短一句话）</label>
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

              {/* Schedule Mode */}
              <div className="border border-gray-100 rounded-xl p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setScheduleMode('now')} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${scheduleMode === 'now' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                    ⚡ 立即推送
                  </button>
                  <button onClick={() => setScheduleMode('later')} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${scheduleMode === 'later' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                    🕐 定时推送
                  </button>
                </div>

                {scheduleMode === 'later' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs text-gray-500">发送时间（{timezone}时区）</label>
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
                  disabled={loading || !message.trim() || selected.size === 0 || (scheduleMode === 'later' && !scheduleTime)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-sm shadow hover:from-red-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '操作中...' : scheduleMode === 'now' ? `🚀 推送给 ${selected.size} 位客户` : `🕐 定时推送给 ${selected.size} 位客户`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
