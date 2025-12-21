// Created by DevOps
// GitHub: https://github.com/githubsantu

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={`border p-2 rounded w-full ${props.className}`}
    />
  );
});

export default Input;

