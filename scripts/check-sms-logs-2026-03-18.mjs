const fetchJson = async (url) => {
  const res = await fetch(url);
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, text };
  }
};

const base = 'https://hiraccoon.com';
const slug = 's7-icy-bubble-kahului';
const target = '2026-03-18';

const toDateInTZ = (iso, timeZone) => {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
};

const summarize = (arr) => {
  const failed = arr.filter((x) => x.status === 'failed');
  const success = arr.filter((x) => x.status === 'success');
  return {
    total: arr.length,
    success: success.length,
    failed: failed.length,
    failedSample: failed.slice(0, 30).map((f) => ({
      recipient_phone: f.recipient_phone,
      sent_at: f.sent_at,
      error_message: f.error_message || null,
    })),
  };
};

const main = async () => {
  const pubUrl = base + '/api/public/merchants/' + encodeURIComponent(slug);
  const pub = await fetchJson(pubUrl);
  if (!pub.ok) {
    console.error('public merchant fetch failed', pub.status);
    console.error(pub.text || pub.json);
    process.exit(1);
  }
  const merchantId = pub.json?.merchant?.id;
  if (!merchantId) {
    console.error('merchantId not found');
    process.exit(1);
  }
  console.log('merchantId:', merchantId);

  const logsUrl =
    base +
    '/api/store/sms-logs?merchantId=' +
    encodeURIComponent(merchantId) +
    '&merchantSlug=' +
    encodeURIComponent(slug);

  const logsRes = await fetchJson(logsUrl);
  if (!logsRes.ok) {
    console.error('sms-logs fetch failed', logsRes.status);
    console.error(logsRes.text || logsRes.json);
    process.exit(1);
  }

  const logs = (logsRes.json?.logs || []).filter((l) => l && l.sent_at);

  const logsUTC = logs.filter((l) => new Date(l.sent_at).toISOString().slice(0, 10) === target);
  const logsNY = logs.filter((l) => toDateInTZ(l.sent_at, 'America/New_York') === target);

  console.log('--- UTC ' + target + ' ---');
  console.log(JSON.stringify(summarize(logsUTC), null, 2));

  console.log('--- NY ' + target + ' ---');
  console.log(JSON.stringify(summarize(logsNY), null, 2));
};

main().catch((e) => {
  console.error('script error', e);
  process.exit(1);
});

