import React, { Component } from 'react';
import gpcCodes from '../../json/gpcCodesMapped.json';

class CategoryItem extends Component {
  constructor(props) {
    super(props);
  }

  render = () => (
    <li onClick={event => this.handleClick(event)}><a href="#">{gpcCodes.segment[this.props.item].description}</a></li>
  )

  handleClick = (event) => {
    event.preventDefault();
    this.props.setCurrentGpc(this.props.item);
    this.props.getProductsByGpc(this.props.item);
  }
}

export default CategoryItem;
