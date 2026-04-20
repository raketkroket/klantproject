interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'green' | 'amber' | 'red' | 'gray' | 'blue';
}

const variants = {
  orange: 'bg-roc-50 text-roc-600 border border-roc-200',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  gray: 'bg-gray-100 text-gray-600 border border-gray-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
};

export default function Badge({ children, variant = 'orange' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
