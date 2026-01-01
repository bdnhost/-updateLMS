import React from 'react';
import UnifiedMessageDialog from './UnifiedMessageDialog';

export default function SimpleMessageDialog(props) {
  // Redirect to the new Unified Dialog
  // Ensure we handle both 'open' and 'isOpen' props for backward compatibility
  const isOpen = props.open || props.isOpen;
  
  return (
    <UnifiedMessageDialog 
      {...props} 
      open={isOpen}
      initialTab={props.initialType || props.initialTab} 
    />
  );
}