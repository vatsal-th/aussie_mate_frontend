import React from 'react';

const FloatingLabelInput = ({ id, name, label, type = "text", value, onChange, required = false, children, placeholder = " " }) => {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        className="peer w-full px-4 py-4 border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#6B7280]"
        placeholder={placeholder}
        required={required}
      />
      <label
        htmlFor={id}
        className="absolute left-3 px-1 bg-white text-gray-500 transition-all duration-200
           text-xs top-0 -translate-y-1/2
           peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-placeholder-shown:translate-y-[-50%]
           peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-primary-500 peer-focus:font-medium"
      >
        {label}
      </label>
      {children}
    </div>
  );
};

export default FloatingLabelInput;
