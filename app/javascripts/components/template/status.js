import React from 'react';

const Status = (props) => {
  return (
    <div id="status" className={"alert alert-"+props.statusType}>{props.statusMessage}</div>
  );
}

export default Status;
