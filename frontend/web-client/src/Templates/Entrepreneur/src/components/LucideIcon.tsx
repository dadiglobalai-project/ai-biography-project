/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function LucideIcon({ name, className = "w-5 h-5", size }: LucideIconProps) {
  // Safe lookup for dynamic icon rendering
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Fallback icon
    return <Icons.HelpCircle className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
}
