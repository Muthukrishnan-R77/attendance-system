import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Alert = ({ type = 'error', message }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}>
      {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <div>{message}</div>
    </div>
  );
};

export default Alert;
