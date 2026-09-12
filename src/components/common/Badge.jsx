import React from 'react';

/**
 * Reusable Badge component for priorities and categories
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  const getVariantClass = () => {
    switch (variant.toLowerCase()) {
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      case 'low':
        return 'badge-low';
      case 'energy':
      case 'electricity':
        return 'badge-energy';
      case 'materials':
      case 'material':
      case 'raw materials':
        return 'badge-materials';
      case 'fuel':
        return 'badge-fuel';
      case 'waste':
        return 'badge-waste';
      case 'success':
        return 'badge-success';
      default:
        return 'badge-low';
    }
  };

  return (
    <span className={`badge ${getVariantClass()} ${className}`}>
      {children}
    </span>
  );
}
