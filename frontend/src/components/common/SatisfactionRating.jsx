import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';

/**
 * SatisfactionRating – Hạng mục 8.3: Khảo sát hài lòng người dân
 * Hiển thị sau khi người dân tải đơn hoặc được giải quyết hồ sơ
 */
export default function SatisfactionRating({ submissionCode, onRated }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const options = [
    {
      key: 'VERY_SATISFIED',
      emoji: '😊',
      label: 'Rất hài lòng',
      color: 'bg-emerald-100 border-emerald-400 text-emerald-800',
      activeColor: 'bg-emerald-400 border-emerald-600 text-white'
    },
    {
      key: 'SATISFIED',
      emoji: '🙂',
      label: 'Hài lòng',
      color: 'bg-amber-50 border-amber-300 text-amber-800',
      activeColor: 'bg-amber-400 border-amber-600 text-white'
    },
    {
      key: 'NEEDS_IMPROVEMENT',
      emoji: '😕',
      label: 'Cần cải thiện',
      color: 'bg-red-50 border-red-300 text-red-800',
      activeColor: 'bg-red-400 border-red-600 text-white'
    }
  ];

  const handleSubmit = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      if (submissionCode) {
        await fetch('/api/submissions/satisfaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionCode, rating: selected })
        });
      }
      setSubmitted(true);
      if (onRated) onRated(selected);
    } catch (e) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 animate-fade-in">
        <div className="text-3xl">🙏</div>
        <p className="text-sm font-semibold text-amber-800 text-center">
          Cảm ơn bà con đã đánh giá!<br />
          <span className="text-xs font-normal text-amber-700">UBND xã Hiệp Hòa ghi nhận ý kiến và sẽ không ngừng cải thiện chất lượng phục vụ.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="border border-amber-300 rounded-2xl bg-amber-50/80 p-4 mt-3">
      <p className="text-center text-sm font-bold text-amber-900 mb-3">
        📊 Bà con đánh giá dịch vụ hành chính xã Hiệp Hòa hôm nay?
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelected(opt.key)}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border-2 font-medium text-xs transition-all duration-200 min-w-[80px]
              ${selected === opt.key ? opt.activeColor + ' scale-105 shadow-md' : opt.color + ' hover:scale-102'}`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="flex justify-center mt-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
          >
            {loading ? '⏳ Đang gửi...' : '✅ Gửi đánh giá'}
          </button>
        </div>
      )}
    </div>
  );
}
