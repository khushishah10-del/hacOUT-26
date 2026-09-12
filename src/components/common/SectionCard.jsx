import React from 'react';

/**
 * Reusable SectionCard container with header, actions, and body
 */
export default function SectionCard({
  title,
  subtitle,
  action,
  icon: Icon,
  children,
  className = ""
}) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {Icon && <Icon size={18} className="text-success" />}
              {title}
            </h3>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
