import React from 'react';
import gpcCodes from '../../json/gpcCodes.json';

const CategoryItem = (props) => {
  return (
    <li><a href="#">{gpcCodes.segment[props.item].description}</a></li>
  );
}

export default CategoryItem;
