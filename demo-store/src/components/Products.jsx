import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { RaisedButton } from 'material-ui';
import IconShoppingCart from 'material-ui/svg-icons/action/shopping-cart';
import { grey400 } from 'material-ui/styles/colors';
import { connect } from 'react-redux';
import { addToCart } from '../redux/actions';
import songs from '../resources/data/songs';

const propTypes = {
  cart: PropTypes.shape({
    total: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

const imgStyle = {
  maxHeight: '100%',
  verticalAlign: 'middle',
  padding: '4px 0',
};

const iconStyle = {
  paddingLeft: '30px',
};

const Products = ({ cart, onAddToCart }) => (
  <div id="products" className="row">
    <Table selectable={false}>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Cover</TableHeaderColumn>
          <TableHeaderColumn>Title</TableHeaderColumn>
          <TableHeaderColumn>Artist</TableHeaderColumn>
          <TableHeaderColumn>Duration</TableHeaderColumn>
          <TableHeaderColumn>Price</TableHeaderColumn>
          <TableHeaderColumn />
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        {songs.map(song => (
          <TableRow key={song.id}>
            <TableRowColumn>
              <img src={song.cover} alt="cover" style={imgStyle} />
            </TableRowColumn>
            <TableRowColumn><b>{song.title}</b></TableRowColumn>
            <TableRowColumn>{song.artist}</TableRowColumn>
            <TableRowColumn>{song.duration}</TableRowColumn>
            <TableRowColumn><b>${song.price}</b></TableRowColumn>
            <TableRowColumn>
              {cart.items.includes(song) ? (
                <IconShoppingCart
                  style={iconStyle}
                  color={grey400}
                />
              ) : (
                <RaisedButton
                  label="buy"
                  onClick={() => onAddToCart(song)}
                />
              )}
            </TableRowColumn>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

Products.propTypes = propTypes;

const mapStateToProps = state => ({
  cart: state,
});

const mapDispatchToProps = dispatch => ({
  onAddToCart: item => dispatch(addToCart(item)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Products);
