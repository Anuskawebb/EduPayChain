import { ethers } from 'ethers';
import { getContract } from './contract';

// EPNS/Push Protocol configuration
const PUSH_CHANNEL_ADDRESS = process.env.NEXT_PUBLIC_PUSH_CHANNEL_ADDRESS || '0x1234567890123456789012345678901234567890';

// Notification types
export enum NotificationType {
  PAYMENT_MADE = 'PaymentMade',
  PAYMENT_VERIFIED = 'PaymentVerified',
  PAYMENT_REFUNDED = 'PaymentRefunded',
  CERTIFICATE_ISSUED = 'CertificateIssued',
  STUDENT_REGISTERED = 'StudentRegistered',
  UNIVERSITY_ADDED = 'UniversityAdded',
  UNIVERSITY_REMOVED = 'UniversityRemoved'
}

// Notification messages
const getNotificationMessage = (type: NotificationType, data: any) => {
  switch (type) {
    case NotificationType.PAYMENT_MADE:
      return `Payment of ${data.amount} ETH made by ${data.student} to ${data.university}`;
    case NotificationType.PAYMENT_VERIFIED:
      return `Payment verified for ${data.student} at ${data.university}`;
    case NotificationType.PAYMENT_REFUNDED:
      return `Payment refunded for ${data.student} at ${data.university}`;
    case NotificationType.CERTIFICATE_ISSUED:
      return `Certificate issued for ${data.student} at ${data.university}`;
    case NotificationType.STUDENT_REGISTERED:
      return `New student registered: ${data.student}`;
    case NotificationType.UNIVERSITY_ADDED:
      return `New university added: ${data.university}`;
    case NotificationType.UNIVERSITY_REMOVED:
      return `University removed: ${data.university}`;
    default:
      return 'New event occurred';
  }
};

// Send browser notification
export const sendBrowserNotification = (title: string, message: string) => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body: message });
        }
      });
    }
  }
};

// Send Push Protocol notification (mock implementation)
export const sendPushNotification = async (type: NotificationType, data: any) => {
  try {
    const message = getNotificationMessage(type, data);
    
    // Mock EPNS notification - in real implementation, you would use EPNS SDK
    console.log('EPNS Notification:', {
      channel: PUSH_CHANNEL_ADDRESS,
      type,
      message,
      data
    });

    // Also send browser notification
    sendBrowserNotification('EduPayChain', message);

    return true;
  } catch (error) {
    console.error('Error sending Push notification:', error);
    return false;
  }
};

// Setup contract event listeners for notifications
export const setupNotificationListeners = () => {
  try {
    const contract = getContract();
    
    // Payment Made event
    contract.on('PaymentMade', (student, university, amount, event) => {
      sendPushNotification(NotificationType.PAYMENT_MADE, {
        student,
        university,
        amount: ethers.formatEther(amount)
      });
    });

    // Payment Verified event
    contract.on('PaymentVerified', (student, university, event) => {
      sendPushNotification(NotificationType.PAYMENT_VERIFIED, {
        student,
        university
      });
    });

    // Payment Refunded event
    contract.on('PaymentRefunded', (student, university, amount, event) => {
      sendPushNotification(NotificationType.PAYMENT_REFUNDED, {
        student,
        university,
        amount: ethers.formatEther(amount)
      });
    });

    // Certificate Issued event
    contract.on('CertificateIssued', (student, university, tokenId, event) => {
      sendPushNotification(NotificationType.CERTIFICATE_ISSUED, {
        student,
        university,
        tokenId: tokenId.toString()
      });
    });

    // Student Registered event
    contract.on('StudentRegistered', (student, event) => {
      sendPushNotification(NotificationType.STUDENT_REGISTERED, {
        student
      });
    });

    // University Added event
    contract.on('UniversityAdded', (name, address, course, fee, event) => {
      sendPushNotification(NotificationType.UNIVERSITY_ADDED, {
        university: name,
        address,
        course,
        fee: ethers.formatEther(fee)
      });
    });

    // University Removed event
    contract.on('UniversityRemoved', (address, event) => {
      sendPushNotification(NotificationType.UNIVERSITY_REMOVED, {
        university: address
      });
    });

    console.log('Notification listeners setup complete');
  } catch (error) {
    console.error('Error setting up notification listeners:', error);
  }
};

// Request notification permissions
export const requestNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Check if notifications are supported
export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Get notification permission status
export const getNotificationPermission = () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}; 