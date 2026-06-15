import { usdToInr } from './currency';

export const formatCurrency = (valueInUsd) => {
  const inr = usdToInr(valueInUsd);
  if (typeof inr !== 'number' || Number.isNaN(inr)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(inr);
};

export const formatInr = (inrValue) => {
  if (typeof inrValue !== 'number' || Number.isNaN(inrValue)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(inrValue);
};

export const formatNumber = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || '';
};

export const percentageChange = (current, previous) => {
  if (!previous || previous === 0) {
    return { text: 'N/A', isPositive: true };
  }
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  return {
    text: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
    isPositive
  };
};

export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getCountryFlag = (country) => {
  const flags = {
    USA: '🇺🇸',
    UK: '🇬🇧',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Brazil: '🇧🇷',
    Mexico: '🇲🇽',
    Spain: '🇪🇸',
    Italy: '🇮🇹',
    Canada: '🇨🇦',
    Sweden: '🇸🇪',
    Austria: '🇦🇹',
    Portugal: '🇵🇹',
    Argentina: '🇦🇷',
    Venezuela: '🇻🇪',
    Belgium: '🇧🇪',
    Switzerland: '🇨🇭',
    Ireland: '🇮🇪',
    Finland: '🇫🇮',
    Poland: '🇵🇱',
    Denmark: '🇩🇰',
    Norway: '🇳🇴',
    India: '🇮🇳'
  };
  return flags[country] || '🌍';
};
