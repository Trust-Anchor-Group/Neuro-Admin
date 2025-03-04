import React from 'react';

export const InputElement = ({ label, name, type, register, errors, required, comment }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-lg">
        {label}{required ? '*' : ''}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`w-full rounded-md border p-3 shadow-sm ${errors[name] ? 'border-red-500' : ''}`}
        {...register(name, { required })}
      />
      
      {errors[name] && <span className="text-red-500 text-xs">{`${label} is required`}</span>}
      
      {comment && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-2 mt-1" role="alert">
          <span className="font-bold">Feedback:</span> {comment}
        </div>
      )}
    </div>
  );
};
