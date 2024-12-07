import React from "react";

const Select = ({ name, options, ...rest }) => {
  return (
    <div className="form-group col-auto">
      <select defaultValue={'DEFAULT'} name={name} id={name} {...rest} className="form-control">
        <option value='DEFAULT'>Open this select menu</option>
        {options.map((option,index) => (
          <option key={index} value={option.address}>
            {option.address}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
