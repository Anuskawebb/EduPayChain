import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          className: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
        };
      case 'verified':
        return {
          icon: CheckCircle,
          text: 'Verified',
          className: 'bg-green-500/20 text-green-200 border-green-500/30'
        };
      case 'refunded':
        return {
          icon: XCircle,
          text: 'Refunded',
          className: 'bg-red-500/20 text-red-200 border-red-500/30'
        };
      default:
        return {
          icon: Clock,
          text: status,
          className: 'bg-gray-500/20 text-gray-200 border-gray-500/30'
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </span>
  );
};

export default StatusBadge;