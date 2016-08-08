import React, { Component } from 'react';
import gpcCodes from '../../json/gpcCodes.json';

class CategoryItem extends Component {
  constructor(props) {
    super(props);
  }

  render = () => (
    <li onClick={event => this.handleClick(event)}><a href="#">{gpcCodes.segment[this.props.item].description}</a></li>
  )

  handleClick = (event) => {
    event.preventDefault();
    this.props.getProductsByGpc(this.props.item);
  }
}

export default CategoryItem;
