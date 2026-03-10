import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'matched'
  | 'missing_books'
  | 'missing_2b'
  | 'value_mismatch'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default';

const variants: Record<BadgeVariant, string> = {
  matched: 'badge-matched',
  missing_books: 'badge-missing-books',
  missing_2b: 'badge-missing-2b',
  value_mismatch: 'badge-mismatch',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  default: 'bg-slate-50 text-slate-600 border border-slate-200',
};

const labels: Record<string, string> = {
  matched: 'Matched',
  missing_books: 'Missing in Books',
  missing_2b: 'Missing in 2B',
  value_mismatch: 'Value Mismatch',
  filed: 'Filed',
  not_filed: 'Not Filed',
  partial: 'Partial',
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  active: 'Active',
  pending: 'Pending',
  reconciled: 'Reconciled',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  value?: string;
  className?: string;
}

export default function Badge({ variant = 'default', children, value, className }: BadgeProps) {
  const displayText = children ?? (value ? labels[value] ?? value : undefined);
  const badgeVariant =
    variant === 'default' && value
      ? (filingStatusVariant(value) ?? variant)
      : variant;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[badgeVariant] ?? variants.default,
        className
      )}
    >
      {displayText}
    </span>
  );
}

function filingStatusVariant(value: string): BadgeVariant | null {
  const map: Record<string, BadgeVariant> = {
    filed: 'success',
    not_filed: 'danger',
    partial: 'warning',
    low: 'success',
    medium: 'warning',
    high: 'danger',
    active: 'info',
    pending: 'warning',
    reconciled: 'success',
    matched: 'matched',
    missing_books: 'missing_books',
    missing_2b: 'missing_2b',
    value_mismatch: 'value_mismatch',
  };
  return map[value] ?? null;
}
