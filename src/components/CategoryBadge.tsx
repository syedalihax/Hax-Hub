import React from 'react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function CategoryBadge({ category, className = '', onClick }: CategoryBadgeProps) {
  const normalized = category.toLowerCase().trim();

  let colors = 'bg-slate-100 text-slate-800 border-slate-200';
  let displayName = category;

  switch (normalized) {
    case 'technology':
      colors = 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      displayName = 'Technology';
      break;
    case 'lifestyle':
      colors = 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
      displayName = 'Lifestyle';
      break;
    case 'productivity':
      colors = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      displayName = 'Productivity';
      break;
    case 'travel':
      colors = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      displayName = 'Travel';
      break;
    case 'personal-growth':
      colors = 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
      displayName = 'Personal Growth';
      break;
  }

  const baseStyle = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition duration-150 ease-in-out cursor-pointer uppercase";

  return (
    <span
      onClick={onClick}
      className={`${baseStyle} ${colors} ${className}`}
    >
      {displayName}
    </span>
  );
}
