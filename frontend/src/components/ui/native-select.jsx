import React from "react";

export function NativeSelect({ id, label, value, onChange, disabled, children }) {
  return (
    <label className="native-select" htmlFor={id}>
      {label ? <span className="native-select__label">{label}</span> : null}
      <div className="native-select__field">
        <select id={id} value={value} onChange={onChange} disabled={disabled}>
          {children}
        </select>
        <span className="native-select__chevron">⌄</span>
      </div>
    </label>
  );
}

export function NativeSelectOption({ value, children }) {
  return <option value={value}>{children}</option>;
}
