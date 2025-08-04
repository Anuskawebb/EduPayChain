'use client';

import React from 'react';
import { useEduPayChain } from '../hooks/useEduPayChain';
import { formatEther } from 'viem';
import { 
  Bell, 
  Building, 
  CreditCard, 
  Award, 
  CheckCircle,
  XCircle 
} from 'lucide-react';

const EventListener: React.FC = () => {
  const { eventLogs } = useEduPayChain();

  // Get recent events (last 5)
  const recentEvents = eventLogs.slice(-5).reverse();

  if (recentEvents.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <Bell className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentEvents.map((event, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
              <div className="flex-shrink-0 mt-0.5">
                {event.type === 'UniversityAdded' && <Building className="h-4 w-4 text-green-600" />}
                {event.type === 'UniversityRemoved' && <XCircle className="h-4 w-4 text-red-600" />}
                {event.type === 'PaymentMade' && <CreditCard className="h-4 w-4 text-blue-600" />}
                {event.type === 'PaymentVerified' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                {event.type === 'CertificateIssued' && <Award className="h-4 w-4 text-yellow-600" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 font-medium">
                  {event.type === 'UniversityAdded' && `University "${event.name}" added`}
                  {event.type === 'UniversityRemoved' && 'University removed'}
                  {event.type === 'PaymentMade' && `Payment: ${formatEther(event.amount)} ETH`}
                  {event.type === 'PaymentVerified' && `Verified: ${formatEther(event.amount)} ETH`}
                  {event.type === 'CertificateIssued' && `Certificate #${event.tokenId.toString()}`}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {event.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventListener;