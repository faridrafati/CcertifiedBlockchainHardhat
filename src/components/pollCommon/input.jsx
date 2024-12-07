import React from "react";

const Input = ({ name, label, error, ...rest }) => {
  return (
    <div className='form-group row my-3'>
      <label className='col-sm-2 col-form-label col-form-label-sm my-2'>
        {label}:
      </label>
      <div className='col-sm-8'>
        <input {...rest} name={name} id={name} className="form-control" />
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    </div>
  );
};

export default Input;
