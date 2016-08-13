import React from 'react';

const GpcOption = ({description, index}) => {

  return (
    <option value={index}>{description}</option>
  );
}

export default GpcOption;
